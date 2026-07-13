package com.chiokore.backend.services.impl;

import com.chiokore.backend.Factorys.VentaFactory;
import com.chiokore.backend.dtos.CobroDTO;
import com.chiokore.backend.dtos.ItemDto;
import com.chiokore.backend.dtos.VentaDiaDTO;
import com.chiokore.backend.dtos.VentasResumenDTO;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.services.IProductoService;
import lombok.RequiredArgsConstructor;
import com.chiokore.backend.modelo.DetalleVenta;
import com.chiokore.backend.modelo.Venta;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.chiokore.backend.repository.VentaRepository;
import com.chiokore.backend.services.IVentaService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;


@Service
@Transactional
@RequiredArgsConstructor
public class VentaService implements IVentaService {

    private final VentaRepository ventaRepository;
    private final IProductoService productoService;
    private final VentaFactory ventaFactory;

    @Override
    public Venta procesarVenta(CobroDTO cobroDTO, Long idTrabajador) {
        return procesarVenta(cobroDTO, idTrabajador, null);
    }

    @Override
    public Venta procesarVenta(CobroDTO cobroDTO, Long idTrabajador, String urlComprobante) {
        if ("TARJETA".equalsIgnoreCase(cobroDTO.getMetodoPago())
                && (urlComprobante == null || urlComprobante.isBlank())) {
            throw new IllegalArgumentException("El cobro con tarjeta requiere la foto del ticket.");
        }

        List<DetalleVenta> detalles = new ArrayList<>();
        double total = 0;

        for (ItemDto item : cobroDTO.getItems()) {
            Producto p = productoService.obtenerPorId(item.getProducto_id());

            if (p.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + p.getNombre());
            }

            p.setStock(p.getStock() - item.getCantidad());
            productoService.guardar(p);

            DetalleVenta detalle = ventaFactory.crearDetalle(p, item.getCantidad());
            detalles.add(detalle);

            total += (p.getPrecio() * item.getCantidad());
        }

        Venta ventafinal = ventaFactory.crearVenta(cobroDTO, detalles, total);
        ventafinal.setUsuarioId(Math.toIntExact(idTrabajador));
        if (urlComprobante != null && !urlComprobante.isBlank()) {
            ventafinal.setUrl_comprobante(urlComprobante);
        }
        return ventaRepository.save(ventafinal);
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
}
