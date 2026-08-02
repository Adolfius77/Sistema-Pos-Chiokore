package com.chiokore.backend.services.impl;

import com.chiokore.backend.Factorys.VentaFactory;
import com.chiokore.backend.dtos.CobroDTO;
import com.chiokore.backend.dtos.ItemDto;
import com.chiokore.backend.dtos.VentaDiaDTO;
import com.chiokore.backend.dtos.VentaResumenDTO;
import com.chiokore.backend.dtos.VentasResumenDTO;
import com.chiokore.backend.modelo.*;
import com.chiokore.backend.repository.ProductoRepository;
import com.chiokore.backend.repository.VentaRepository;
import com.chiokore.backend.services.IProductoService;
import com.chiokore.backend.services.IPromocionService;
import com.chiokore.backend.services.IVentaService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;


@Service
@Transactional
@RequiredArgsConstructor
public class VentaService implements IVentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final IProductoService productoService;
    private final IPromocionService promocionService;
    private final VentaFactory ventaFactory;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(VentaService.class);

    @Override
    public Venta procesarVenta(CobroDTO cobroDTO, Long idTrabajador, String urlComprobante, String cajeroNombre, String dispositivoModelo, String ipOrigen) {
        if ("TARJETA".equalsIgnoreCase(cobroDTO.getMetodoPago())
                && (urlComprobante == null || urlComprobante.isBlank())) {
            throw new IllegalArgumentException("El cobro con tarjeta requiere la foto del ticket.");
        }

        List<DetalleVenta> detalles = new ArrayList<>();
        double total = 0;
        LocalDate hoy = LocalDate.now();

        for (ItemDto item : cobroDTO.getItems()) {
            Producto p = productoService.obtenerPorId(item.getProducto_id());

            if (p.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + p.getNombre());
            }

            p.setStock(p.getStock() - item.getCantidad());
            productoService.guardar(p);

            double precioUnitario = calcularPrecioConPromocion(p, item.getCantidad(), hoy);
            double subtotal = precioUnitario * item.getCantidad();

            DetalleVenta detalle = ventaFactory.crearDetalle(p, item.getCantidad(), precioUnitario);
            detalles.add(detalle);

            total += subtotal;
        }

        Venta ventafinal = ventaFactory.crearVenta(cobroDTO, detalles, total);
        ventafinal.setUsuarioId(Math.toIntExact(idTrabajador));
        if (urlComprobante != null && !urlComprobante.isBlank()) {
            ventafinal.setUrl_comprobante(urlComprobante);
        }
        ventafinal.setCajero_nombre(cajeroNombre);
        ventafinal.setDispositivo_modelo(dispositivoModelo);
        ventafinal.setIp_origen(ipOrigen);
        return ventaRepository.save(ventafinal);
    }

    private double calcularPrecioConPromocion(Producto producto, int cantidad, LocalDate fecha) {
        // Por defecto usar el precio del producto
        double precioBase = producto.getPrecio();
        if (producto.getCategoria() == null) return precioBase;

        Optional<Promocion> promoOpt = promocionService.buscarPromocionActivaPorCategoria(
                producto.getCategoria().getId(), fecha);

        if (promoOpt.isEmpty()) return precioBase;

        Promocion promo = promoOpt.get();

        // Si hay precio por paquete, calcular precio unitario de ese paquete
        if (promo.getCantidadPaquete() > 0 && promo.getPrecioPaquete() > 0) {
            double precioUnitarioPaquete = promo.getPrecioPaquete() / (double) promo.getCantidadPaquete();
            // Aplicar la promo por paquete solo si reduce el precio unitario respecto al precio base
            if (precioUnitarioPaquete < precioBase) {
                // calcular media ponderada entre paquetes y resto
                int paquetes = cantidad / promo.getCantidadPaquete();
                int resto = cantidad % promo.getCantidadPaquete();
                double total = paquetes * promo.getPrecioPaquete() + resto * precioBase;
                return Math.round((total / (double) cantidad) * 100.0) / 100.0;
            } else {
                return precioBase;
            }
        }

        // Precio promocional directo: aplicar solo si es menor que el precio base
        if (promo.getPrecioPromocional() > 0 && promo.getPrecioPromocional() < precioBase) {
            return Math.round(promo.getPrecioPromocional() * 100.0) / 100.0;
        }

        return precioBase;
    }

    @Override
    public VentasResumenDTO resumen(LocalDate desde, LocalDate hasta) {
        List<Venta> ventas = ventaRepository.findCompletadasEntre(
                desde.atStartOfDay(), hasta.atTime(LocalTime.MAX));
        double total = ventas.stream().mapToDouble(Venta::getTotal).sum();
        return new VentasResumenDTO(desde, hasta, ventas.size(), total);
    }

    @Override
    public List<VentaDiaDTO> ventasPorDia(LocalDate desde, LocalDate hasta) {
        Map<LocalDate, double[]> acumulado = new TreeMap<>(); // [total, conteo]
        for (Venta v : ventaRepository.findCompletadasEntre(desde.atStartOfDay(), hasta.atTime(LocalTime.MAX))) {
            LocalDate dia = v.getFecha_hora().toLocalDate();
            double[] a = acumulado.computeIfAbsent(dia, k -> new double[2]);
            a[0] += v.getTotal();
            a[1] += 1;
        }
        List<VentaDiaDTO> resultado = new ArrayList<>();
        acumulado.forEach((dia, a) -> resultado.add(new VentaDiaDTO(dia, (long) a[1], a[0])));
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> listarPorFecha(LocalDate fecha) {
        return listarPorRango(fecha, fecha);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> listarPorRango(LocalDate desde, LocalDate hasta) {
        LocalDateTime inicio = desde.atStartOfDay();
        LocalDateTime fin = hasta.plusDays(1).atStartOfDay();
        return ventaRepository.findByRangoFecha(inicio, fin);
    }

    @Override
    @Transactional(readOnly = true)
    public Venta obtenerDetalle(int id) {
        return ventaRepository.findByIdWithDetalles((long) id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
    }

    @Override
    public Venta cancelarVenta(int id) {
        Venta venta = ventaRepository.findByIdWithDetalles((long) id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        if (venta.getEstado() != null && venta.getEstado().name().equalsIgnoreCase("CANCELADA")) {
            throw new IllegalArgumentException("La venta ya está cancelada.");
        }

        // Restaurar stock por cada detalle
        for (DetalleVenta d : venta.getDetalles()) {
            if (d.getProducto() != null) {
                Producto p = productoService.obtenerPorId(d.getProducto().getId());
                p.setStock(p.getStock() + d.getCantidad());
                productoService.guardar(p);
            }
        }

        venta.setEstado(EstadoVenta.CANCELADA);
        return ventaRepository.save(venta);
    }

    @Override
    @Transactional(readOnly = true)
    public VentaResumenDTO resumenPorFecha(LocalDate fecha) {
        List<Venta> ventas = listarPorFecha(fecha);
        double totalGeneral = 0;
        double totalEfectivo = 0;
        double totalTarjeta = 0;

        for (Venta v : ventas) {
            totalGeneral += v.getTotal();
            if ("EFECTIVO".equalsIgnoreCase(v.getMetodo_pago())) {
                totalEfectivo += v.getTotal();
            } else if ("TARJETA".equalsIgnoreCase(v.getMetodo_pago())) {
                totalTarjeta += v.getTotal();
            }
        }

        long stockBajo = productoRepository.findAll().stream()
                .filter(Producto::isActivo)
                .filter(p -> p.getStock() <= 3)
                .count();

        return new VentaResumenDTO(ventas.size(), totalGeneral, totalEfectivo, totalTarjeta, stockBajo);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarReporteExcel(LocalDate desde, LocalDate hasta) {
        List<Venta> ventas = listarPorRango(desde, hasta);
        DateTimeFormatter fechaFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Ventas");
            String[] headers = {
                    "Folio", "Fecha y hora", "Total", "Metodo de pago", "Estado", "Referencia",
                    "Cajero", "Dispositivo", "IP origen"
            };

            // Title and subtitle styles
            var titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short)16);

            var titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);

            var subtitleFont = workbook.createFont();
            subtitleFont.setItalic(true);
            subtitleFont.setFontHeightInPoints((short)11);

            var subtitleStyle = workbook.createCellStyle();
            subtitleStyle.setFont(subtitleFont);
            subtitleStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);

            // Header style
            var headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short)11);

            var headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);
            headerStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            headerStyle.setWrapText(true);

            // Data styles
            short dateFormat = workbook.createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss");
            var dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(dateFormat);

            short currencyFormat = workbook.createDataFormat().getFormat("$#,##0.00");
            var currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(currencyFormat);
            currencyStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.RIGHT);

            var normalStyle = workbook.createCellStyle();
            normalStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.LEFT);
            normalStyle.setWrapText(true);

            var altStyle = workbook.createCellStyle();
            altStyle.cloneStyleFrom(normalStyle);
            altStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.GREY_25_PERCENT.getIndex());
            altStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);

            // Title row (merged)
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Chiokore POS — Reporte de ventas");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, headers.length - 1));

            // Subtitle with date range
            Row subtitleRow = sheet.createRow(1);
            Cell subtitleCell = subtitleRow.createCell(0);
            subtitleCell.setCellValue(String.format("Desde: %s    Hasta: %s", desde.toString(), hasta.toString()));
            subtitleCell.setCellStyle(subtitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, headers.length - 1));

            // Extended header row (include Producto y Cantidad)
            String[] extendedHeaders = new String[] {
                    "Folio", "Fecha y hora", "Producto", "Cantidad", "Precio unitario", "Total", "Metodo de pago", "Estado", "Referencia", "Cajero", "Dispositivo", "IP origen"
            };

            int headerRowIndex = 2;
            Row headerRow = sheet.createRow(headerRowIndex);
            for (int i = 0; i < extendedHeaders.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(extendedHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            // Freeze pane under header
            sheet.createFreezePane(0, headerRowIndex + 1);

            // Data rows: one row per detalleVenta
            int rowIdx = headerRowIndex + 1;
            double totalGeneral = 0;
            boolean alternate = false;
            for (Venta venta : ventas) {
                List<DetalleVenta> detalles = venta.getDetalles();
                if (detalles == null || detalles.isEmpty()) {
                    Row row = sheet.createRow(rowIdx++);
                    Cell c0 = row.createCell(0);
                    c0.setCellValue(venta.getId());
                    c0.setCellStyle(alternate ? altStyle : normalStyle);

                    Cell fechaCell = row.createCell(1);
                    if (venta.getFecha_hora() != null) {
                        fechaCell.setCellValue(java.sql.Timestamp.valueOf(venta.getFecha_hora()));
                        fechaCell.setCellStyle(dateStyle);
                    }

                    // empty product cells
                    row.createCell(2).setCellValue("");
                    row.createCell(3).setCellValue(0);
                    row.createCell(4).setCellValue(0);

                    Cell totalCell = row.createCell(5);
                    totalCell.setCellValue(venta.getTotal());
                    totalCell.setCellStyle(currencyStyle);
                    totalGeneral += venta.getTotal();

                    row.createCell(6).setCellValue(venta.getMetodo_pago() != null ? venta.getMetodo_pago() : "");
                    row.createCell(7).setCellValue(venta.getEstado() != null ? venta.getEstado().name() : "");
                    row.createCell(8).setCellValue(venta.getReferencia() != null ? venta.getReferencia() : "");
                    row.createCell(9).setCellValue(venta.getCajero_nombre() != null ? venta.getCajero_nombre() : "");
                    row.createCell(10).setCellValue(venta.getDispositivo_modelo() != null ? venta.getDispositivo_modelo() : "");
                    row.createCell(11).setCellValue(venta.getIp_origen() != null ? venta.getIp_origen() : "");

                    alternate = !alternate;
                    continue;
                }

                for (DetalleVenta d : detalles) {
                    Row row = sheet.createRow(rowIdx++);

                    Cell c0 = row.createCell(0);
                    c0.setCellValue(venta.getId());
                    c0.setCellStyle(alternate ? altStyle : normalStyle);

                    Cell fechaCell = row.createCell(1);
                    if (venta.getFecha_hora() != null) {
                        fechaCell.setCellValue(java.sql.Timestamp.valueOf(venta.getFecha_hora()));
                        fechaCell.setCellStyle(dateStyle);
                    }

                    String productoNombre = d.getProducto() != null ? d.getProducto().getNombre() : "";
                    row.createCell(2).setCellValue(productoNombre);

                    row.createCell(3).setCellValue(d.getCantidad());

                    Cell precioUnit = row.createCell(4);
                    precioUnit.setCellValue(d.getPrecio_unitario_capturado());
                    precioUnit.setCellStyle(currencyStyle);

                    Cell totalCell = row.createCell(5);
                    double lineTotal = d.getCantidad() * d.getPrecio_unitario_capturado();
                    totalCell.setCellValue(lineTotal);
                    totalCell.setCellStyle(currencyStyle);
                    totalGeneral += lineTotal;

                    row.createCell(6).setCellValue(venta.getMetodo_pago() != null ? venta.getMetodo_pago() : "");
                    row.createCell(7).setCellValue(venta.getEstado() != null ? venta.getEstado().name() : "");
                    row.createCell(8).setCellValue(venta.getReferencia() != null ? venta.getReferencia() : "");
                    row.createCell(9).setCellValue(venta.getCajero_nombre() != null ? venta.getCajero_nombre() : "");
                    row.createCell(10).setCellValue(venta.getDispositivo_modelo() != null ? venta.getDispositivo_modelo() : "");
                    row.createCell(11).setCellValue(venta.getIp_origen() != null ? venta.getIp_origen() : "");

                    alternate = !alternate;
                }
            }

            // Totals row (after a blank row)
            int totalsRowIndex = rowIdx + 1;
            Row totalsLabelRow = sheet.createRow(totalsRowIndex);
            Cell totalLabelCell = totalsLabelRow.createCell(4);
            totalLabelCell.setCellValue("Total ventas:");
            var totalFont = workbook.createFont();
            totalFont.setBold(true);
            var totalStyle = workbook.createCellStyle();
            totalStyle.setFont(totalFont);
            totalLabelCell.setCellStyle(totalStyle);

            Cell totalValueCell = totalsLabelRow.createCell(5);
            totalValueCell.setCellValue(totalGeneral);
            var totalCurrencyStyle = workbook.createCellStyle();
            totalCurrencyStyle.setFont(totalFont);
            totalCurrencyStyle.setDataFormat(currencyFormat);
            totalCurrencyStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.RIGHT);
            totalValueCell.setCellStyle(totalCurrencyStyle);

            // Auto-filter
            sheet.setAutoFilter(new CellRangeAddress(headerRowIndex, headerRowIndex, 0, extendedHeaders.length - 1));

            // Column widths (some fixed, rest autosize)
            sheet.setColumnWidth(0, 8 * 256);   // Folio
            sheet.setColumnWidth(1, 20 * 256);  // Fecha
            sheet.setColumnWidth(2, 30 * 256);  // Producto
            sheet.setColumnWidth(3, 10 * 256);  // Cantidad
            sheet.setColumnWidth(4, 14 * 256);  // Precio unitario
            sheet.setColumnWidth(5, 14 * 256);  // Total
            sheet.setColumnWidth(6, 14 * 256);  // Metodo
            sheet.setColumnWidth(7, 12 * 256);  // Estado
            sheet.setColumnWidth(8, 28 * 256);  // Referencia
            sheet.setColumnWidth(9, 20 * 256);  // Cajero
            sheet.setColumnWidth(10, 20 * 256); // Dispositivo
            sheet.setColumnWidth(11, 16 * 256); // IP

            // Autosize any remaining columns if needed
            for (int i = 0; i < extendedHeaders.length; i++) {
                // small autoSize pass to refine widths
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("No se pudo generar el reporte en Excel.", e);
        }
    }

    @Override
    public int recalcularTotales() {
        List<Venta> ventas = ventaRepository.findAll();
        int updated = 0;
        for (Venta v : ventas) {
            List<DetalleVenta> detalles = v.getDetalles();
            double sum = 0.0;
            if (detalles != null) {
                for (DetalleVenta d : detalles) {
                    sum += d.getCantidad() * d.getPrecio_unitario_capturado();
                }
            }
            if (Double.compare(v.getTotal(), sum) != 0) {
                v.setTotal(sum);
                ventaRepository.save(v);
                updated++;
            }
        }
        return updated;
    }

    @Override
    public Venta recalcularVenta(int id) {
        Venta v = ventaRepository.findByIdWithDetalles((long) id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
        double sum = 0.0;
        if (v.getDetalles() != null) {
            for (DetalleVenta d : v.getDetalles()) {
                sum += d.getCantidad() * d.getPrecio_unitario_capturado();
            }
        }
        v.setTotal(sum);
        return ventaRepository.save(v);
    }

    @Override
    public int recalcularPrecios() {
        List<Venta> ventas = ventaRepository.findAll();
        int updated = 0;
        for (Venta v : ventas) {
            boolean changed = false;
            if (v.getDetalles() != null) {
                LocalDate fecha = v.getFecha_hora() != null ? v.getFecha_hora().toLocalDate() : LocalDate.now();
                for (DetalleVenta d : v.getDetalles()) {
                    Producto p = d.getProducto();
                    if (p == null) continue;
                    double nuevo = calcularPrecioConPromocion(p, d.getCantidad(), fecha);
                    if (Double.compare(d.getPrecio_unitario_capturado(), nuevo) != 0) {
                        d.setPrecio_unitario_capturado(nuevo);
                        changed = true;
                    }
                }
            }
            if (changed) {
                // recalcular total
                double sum = v.getDetalles().stream().mapToDouble(d -> d.getCantidad() * d.getPrecio_unitario_capturado()).sum();
                v.setTotal(sum);
                ventaRepository.save(v);
                updated++;
            }
        }
        return updated;
    }

    @Override
    public Venta recalcularPreciosVenta(int id) {
        Venta v = ventaRepository.findByIdWithDetalles((long) id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
        boolean changed = false;
        LocalDate fecha = v.getFecha_hora() != null ? v.getFecha_hora().toLocalDate() : LocalDate.now();
        if (v.getDetalles() != null) {
            for (DetalleVenta d : v.getDetalles()) {
                Producto p = d.getProducto();
                if (p == null) continue;
                double nuevo = calcularPrecioConPromocion(p, d.getCantidad(), fecha);
                if (Double.compare(d.getPrecio_unitario_capturado(), nuevo) != 0) {
                    d.setPrecio_unitario_capturado(nuevo);
                    changed = true;
                }
            }
        }
        if (changed) {
            double sum = v.getDetalles().stream().mapToDouble(d -> d.getCantidad() * d.getPrecio_unitario_capturado()).sum();
            v.setTotal(sum);
            return ventaRepository.save(v);
        }
        return v;
    }
}
