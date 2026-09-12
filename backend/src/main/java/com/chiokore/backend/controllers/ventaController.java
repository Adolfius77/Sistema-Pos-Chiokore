package com.chiokore.backend.controllers;

import com.chiokore.backend.dtos.CobroDTO;
import com.chiokore.backend.modelo.Venta;
import com.chiokore.backend.services.IVentaService;
import com.chiokore.backend.services.ImageStorageService;
import com.chiokore.backend.utils.UserAgentUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class ventaController {
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ventaController.class);
    private final IVentaService ventaService;
    private final ImageStorageService imageStorageService;

    // GET /api/ventas?desde=2026-07-01&hasta=2026-07-15
    // Resumen de ventas completadas del periodo. Lo consume el modulo de Nomina.
    @GetMapping
    public ResponseEntity<?> resumen(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(ventaService.resumen(desde, hasta));
    }

    // GET /api/ventas/diario?desde=...&hasta=...  -> ventas agrupadas por dia
    @GetMapping("/diario")
    public ResponseEntity<?> ventasPorDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(ventaService.ventasPorDia(desde, hasta));
    }

    // Admin: lista de ventas de un dia
    @GetMapping("/dia")
    public ResponseEntity<?> listarPorFecha(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        if (desde != null || hasta != null) {
            if (desde == null || hasta == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Debes enviar desde y hasta para filtrar por rango."));
            }
            if (hasta.isBefore(desde)) {
                return ResponseEntity.badRequest().body(Map.of("error", "La fecha hasta no puede ser menor a la fecha desde."));
            }
            return ResponseEntity.ok(ventaService.listarPorRango(desde, hasta));
        }

        LocalDate dia = fecha != null ? fecha : LocalDate.now();
        return ResponseEntity.ok(ventaService.listarPorFecha(dia));
    }

    // Admin: resumen del dia (efectivo/tarjeta/stock bajo)
    @GetMapping("/resumen-dia")
    public ResponseEntity<?> resumenDia(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        LocalDate dia = fecha != null ? fecha : LocalDate.now();
        return ResponseEntity.ok(ventaService.resumenPorFecha(dia));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<?> obtenerDetalle(@PathVariable int id) {
        return ResponseEntity.ok(ventaService.obtenerDetalle(id));
    }

    @PostMapping("/{id:\\d+}/cancelar")
    public ResponseEntity<?> cancelarVenta(@PathVariable int id) {
        Venta v = ventaService.cancelarVenta(id);
        return ResponseEntity.ok(Map.of("mensaje", "Venta cancelada", "venta", v));
    }

    @PostMapping(value = "/cobrar", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> ProcesarCobro(@RequestBody CobroDTO venta, @AuthenticationPrincipal Jwt jwt, HttpServletRequest request) {
        return procesar(venta, null, jwt, request);
    }

    @PostMapping(value = "/cobrar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> ProcesarCobroTarjeta(
            @RequestPart("datos") CobroDTO venta,
            @RequestPart("ticket") MultipartFile ticket,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request
    ) {
        String urlComprobante = imageStorageService.guardarTicket(ticket);
        return procesar(venta, urlComprobante, jwt, request);
    }

    @GetMapping(value = "/reporte-excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<?> descargarReporteExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        if (hasta.isBefore(desde)) {
            return ResponseEntity.badRequest().body(Map.of("error", "La fecha hasta no puede ser menor a la fecha desde."));
        }

        byte[] contenido = ventaService.generarReporteExcel(desde, hasta);
        String nombre = "chiokore-reporte-ventas-" + desde + "_a_" + hasta + ".xlsx";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment().filename(nombre).build());
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

        return ResponseEntity.ok().headers(headers).body(contenido);
    }

    /**
     * Tronco comun del cobro en efectivo y con tarjeta.
     *
     * Los errores de negocio (stock insuficiente, cantidades invalidas, producto
     * inexistente) suben y los traduce GlobalExceptionHandler al codigo HTTP que
     * corresponde, con un mensaje limpio para el cajero.
     */
    private ResponseEntity<?> procesar(CobroDTO venta, String urlComprobante, Jwt jwt, HttpServletRequest request) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Acceso denegado: token requerido.",
                                 "error", "Acceso denegado: token requerido."));
        }

        Long idTrabajador = jwt.getClaim("empleadoId");
        String nombreCajero = jwt.getSubject();

        if (idTrabajador == null) {
            String aviso = "Acceso denegado: el token no contiene un ID de trabajador valido.";
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", aviso, "error", aviso));
        }

        String dispositivo = venta.getModeloDispositivo();
        if (dispositivo == null || dispositivo.isBlank()) {
            // El frontend no pudo detectar el modelo exacto: se traduce el
            // User-Agent a una etiqueta legible en lugar de guardarlo crudo.
            dispositivo = UserAgentUtil.aEtiquetaLegible(request.getHeader("User-Agent"));
        }

        Venta ventaProcesada = ventaService.procesarVenta(
                venta,
                idTrabajador,
                urlComprobante,
                nombreCajero,
                dispositivo,
                extraerIpCliente(request)
        );

        Map<String, Object> response = new HashMap<>();
        double restante = ventaProcesada.getTotal() - ventaProcesada.getMonto_recibido();
        if (restante > 0) {
            response.put("mensaje", "Venta registrada como PENDIENTE. Falta pago de: " + restante);
            response.put("restante", restante);
        } else {
            response.put("mensaje", "Venta procesada correctamente");
        }
        response.put("cajero", nombreCajero);
        response.put("idTrabajador", idTrabajador);
        response.put("venta", ventaProcesada);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/recalcular-totales")
    public ResponseEntity<?> recalcularTotales() {
        int updated = ventaService.recalcularTotales();
        return ResponseEntity.ok(Map.of("mensaje", "Totales recalculados", "actualizados", updated));
    }

    @PostMapping("/{id:\\d+}/recalcular")
    public ResponseEntity<?> recalcularVenta(@PathVariable int id) {
        Venta v = ventaService.recalcularVenta(id);
        return ResponseEntity.ok(Map.of("mensaje", "Venta recalculada", "venta", v));
    }

    @PostMapping("/recalcular-precios")
    public ResponseEntity<?> recalcularPrecios() {
        int updated = ventaService.recalcularPrecios();
        return ResponseEntity.ok(Map.of("mensaje", "Precios recalculados", "actualizados", updated));
    }

    @PostMapping("/{id:\\d+}/recalcular-precios")
    public ResponseEntity<?> recalcularPreciosVenta(@PathVariable int id) {
        Venta v = ventaService.recalcularPreciosVenta(id);
        return ResponseEntity.ok(Map.of("mensaje", "Precios de venta recalculados", "venta", v));
    }

    private String extraerIpCliente(HttpServletRequest request) {
        String header = request.getHeader("X-Forwarded-For");
        if (header != null && !header.isBlank()) {
            String[] partes = header.split(",");
            if (partes.length > 0) {
                return partes[0].trim();
            }
        }

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }
}
