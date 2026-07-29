package com.chiokore.backend.controllers;

import com.chiokore.backend.modelo.Promocion;
import com.chiokore.backend.repository.PromocionesRepository;
import com.chiokore.backend.services.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promociones")
@RequiredArgsConstructor
public class PromocionController {
    private final PromocionesRepository repo;
    private final ImageStorageService imageStorageService;

    @GetMapping("/activas")
    public List<Promocion> obtenerPromocionesActivas() {
        return repo.findByActivoTrue();
    }

    @GetMapping
    public List<Promocion> listarTodas() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Promocion obtenerPorId(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Promocion> crearPromocion(@RequestPart("promocion") Promocion promocion, @RequestPart(value = "imagen", required = false) MultipartFile imagen)  {
        if (imagen !=null && !imagen.isEmpty()) {
            String nombreImagen = imageStorageService.guardar("promociones", imagen);
            promocion.setUrl_imagen(nombreImagen);
        }
        Promocion guardada = repo.save(promocion);
        return ResponseEntity.ok(guardada);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Promocion> actualizar(@PathVariable Long id, @RequestPart("promocion") Promocion promocion, @RequestPart(value = "imagen", required = false) MultipartFile imagen) {
        Promocion existente = repo.findById(id).orElseThrow();
        existente.setNombre(promocion.getNombre());
        existente.setDescuento(promocion.getDescuento());
        existente.setPrecioPromocional(promocion.getPrecioPromocional());
        existente.setCantidadPaquete(promocion.getCantidadPaquete());
        existente.setPrecioPaquete(promocion.getPrecioPaquete());
        existente.setActivo(promocion.isActivo());
        
        if (imagen != null && !imagen.isEmpty()) {
            existente.setUrl_imagen(imageStorageService.guardar("promociones", imagen));
        }
        return ResponseEntity.ok(repo.save(existente));
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<Promocion> cambiarActivo(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Promocion promo = repo.findById(id).orElseThrow();
        promo.setActivo(body.get("activo"));
        return ResponseEntity.ok(repo.save(promo));
    }
}
