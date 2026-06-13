package com.chiokore.backend.controllers;

import com.chiokore.backend.services.impl.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaService categoriaService;

    public ResponseEntity<?> obtenerCategorias() {
        try{
            return ResponseEntity.ok(categoriaService.obtenerTodas());
        }catch (Exception e){
            return ResponseEntity.status(500).body("Error al obtener las categorias: " + e.getMessage());
        }
    }
}
