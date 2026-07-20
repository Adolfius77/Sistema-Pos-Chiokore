package com.chiokore.backend.controllers;

import com.chiokore.backend.dtos.CategoriaAdminDTO;
import com.chiokore.backend.modelo.Categoria;
import com.chiokore.backend.repository.ProductoRepository;
import com.chiokore.backend.services.ICategoriasService;
import com.chiokore.backend.services.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final ICategoriasService categoriaService;
    private final ProductoRepository productoRepository;
    private final ImageStorageService imageStorageService;

    @GetMapping
    public ResponseEntity<?> obtenerCategorias() {
        return ResponseEntity.ok(categoriaService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable int id) {
        try {
            return ResponseEntity.ok(categoriaService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return error(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crear(
            @RequestPart("datos") CategoriaAdminDTO datos,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen
    ) {
        try {
            Categoria categoria = new Categoria();
            aplicarDatos(categoria, datos);
            if (imagen != null && !imagen.isEmpty()) {
                categoria.setUrl_imagen(imageStorageService.guardar("categorias", imagen));
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.guardar(categoria));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizar(
            @PathVariable int id,
            @RequestPart("datos") CategoriaAdminDTO datos,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen
    ) {
        try {
            Categoria existente = categoriaService.obtenerPorId(id);
            aplicarDatos(existente, datos);
            if (imagen != null && !imagen.isEmpty()) {
                existente.setUrl_imagen(imageStorageService.guardar("categorias", imagen));
            }
            return ResponseEntity.ok(categoriaService.guardar(existente));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (RuntimeException e) {
            return error(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        try {
            categoriaService.obtenerPorId(id);
            long productos = productoRepository.findByCategoriaId((long) id).size();
            if (productos > 0) {
                return error(HttpStatus.BAD_REQUEST,
                        "No se puede eliminar la categoría porque tiene " + productos + " producto(s).");
            }
            categoriaService.eliminar(id);
            Map<String, String> ok = new HashMap<>();
            ok.put("mensaje", "Categoría eliminada");
            return ResponseEntity.ok(ok);
        } catch (RuntimeException e) {
            return error(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    private void aplicarDatos(Categoria categoria, CategoriaAdminDTO datos) {
        if (datos.getNombre() == null || datos.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio.");
        }
        categoria.setNombre(datos.getNombre().trim());
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String mensaje) {
        Map<String, String> body = new HashMap<>();
        body.put("mensaje", mensaje);
        body.put("error", mensaje);
        return ResponseEntity.status(status).body(body);
    }
}
