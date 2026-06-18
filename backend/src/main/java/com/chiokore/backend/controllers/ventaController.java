package com.chiokore.backend.controllers;

import com.chiokore.backend.dtos.CobroDTO;
import lombok.RequiredArgsConstructor;
import com.chiokore.backend.modelo.Venta;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.chiokore.backend.services.IVentaService;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://localhost:8080")
@RequiredArgsConstructor
public class ventaController {
    private final IVentaService ventaService;

    @PostMapping("/cobrar")
    public ResponseEntity<?> ProcesarCobro(@RequestBody CobroDTO venta) {
      Venta ventaCompleta = ventaService.procesarVenta(venta);
      return ResponseEntity.status(HttpStatus.CREATED).body(ventaCompleta);
    }
}