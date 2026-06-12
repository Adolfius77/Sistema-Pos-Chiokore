package com.chiokore.backend.controllers;

import com.chiokore.backend.services.IProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ProductoController {
    private final IProductoService productoService;

    @GetMapping("/activos")
    public ResponseEntity<?> obtenerProductos(){
        try{
            return ResponseEntity.ok(productoService.obtenerActivos());
        }catch (Exception e){
            return ResponseEntity.status(500).body("Error al obtener los productos: " + e.getMessage());
        }
    }
}
