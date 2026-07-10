package com.chiokore.backend.controllers;

import com.chiokore.backend.dtos.CobroDTO;
import lombok.RequiredArgsConstructor;
import com.chiokore.backend.modelo.Venta;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.chiokore.backend.services.IVentaService;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class ventaController {
    private final IVentaService ventaService;

    @PostMapping("/cobrar")
    public ResponseEntity<?> ProcesarCobro(@RequestBody CobroDTO venta, @AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long idTrabajador;
            String nombreCajero;

            if (jwt != null) {

                idTrabajador = jwt.getClaim("empleadoId");
                nombreCajero = jwt.getSubject();
            } else {
                //datos de prueba
                idTrabajador = 1L;
                nombreCajero = "Cajero Prueba";
            }


            if (idTrabajador == null) {
                response.put("mensaje", "Acceso denegado: El token no contiene un ID de trabajador valido.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            var ventaProcesada = ventaService.procesarVenta(venta, idTrabajador);
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