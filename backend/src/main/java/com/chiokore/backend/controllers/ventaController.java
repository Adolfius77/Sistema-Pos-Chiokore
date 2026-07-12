package com.chiokore.backend.controllers;

import com.chiokore.backend.dtos.CobroDTO;
import com.chiokore.backend.modelo.Venta;
import com.chiokore.backend.services.IVentaService;
import com.chiokore.backend.services.TicketStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class ventaController {
    private final IVentaService ventaService;
    private final TicketStorageService ticketStorageService;

    @PostMapping(value = "/cobrar", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> ProcesarCobro(@RequestBody CobroDTO venta, @AuthenticationPrincipal Jwt jwt) {
        return procesar(venta, null, jwt);
    }

    @PostMapping(value = "/cobrar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> ProcesarCobroTarjeta(
            @RequestPart("datos") CobroDTO venta,
            @RequestPart("ticket") MultipartFile ticket,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String urlComprobante = ticketStorageService.guardarTicket(ticket);
        return procesar(venta, urlComprobante, jwt);
    }

    private ResponseEntity<?> procesar(CobroDTO venta, String urlComprobante, Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long idTrabajador;
            String nombreCajero;

            if (jwt != null) {
                idTrabajador = jwt.getClaim("empleadoId");
                nombreCajero = jwt.getSubject();
            } else {
                idTrabajador = 1L;
                nombreCajero = "Cajero Prueba";
            }

            if (idTrabajador == null) {
                response.put("mensaje", "Acceso denegado: El token no contiene un ID de trabajador valido.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Venta ventaProcesada = ventaService.procesarVenta(venta, idTrabajador, urlComprobante);
            response.put("mensaje", "venta procesada correctamente");
            response.put("cajero", nombreCajero);
            response.put("idTrabajador", idTrabajador);
            response.put("venta", ventaProcesada);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("mensaje", "Error en la venta");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("mensaje", "Error interno al procesar el cobro");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
