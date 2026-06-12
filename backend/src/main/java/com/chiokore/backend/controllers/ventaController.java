package com.chiokore.backend.controllers;

import lombok.RequiredArgsConstructor;
import com.chiokore.backend.modelo.Venta;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.chiokore.backend.services.IVentaService;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ventaController {
    private final IVentaService ventaService;

    @PostMapping("/cobrar")
    public ResponseEntity<?> ProcesarCobro(@RequestBody Venta venta) {
        try {
            Venta ventaCompleta = ventaService.procesarVenta(venta);
            return ResponseEntity.ok(ventaCompleta);
        }catch (Exception e) {
            return ResponseEntity.status(500).body("Error al procesar la venta: " + e.getMessage());
        }
    }
}