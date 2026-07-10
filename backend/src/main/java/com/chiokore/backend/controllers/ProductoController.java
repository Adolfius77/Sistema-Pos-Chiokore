package com.chiokore.backend.controllers;

import com.chiokore.backend.services.IProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {
    private final IProductoService productoService;

    @GetMapping("/activos")
    public ResponseEntity<?> obtenerProductos(){
        return ResponseEntity.ok(productoService.obtenerActivos());
    }
    @GetMapping("/categoria/{id}")
    public ResponseEntity<?> obtenerPorCategoria(@PathVariable int id){
        return ResponseEntity.ok(productoService.encontrarPorCategoria(id));
    }
}
