package com.chiokore.backend.controllers;

import com.chiokore.backend.Exceptions.RecursoNoEncontradoException;
import com.chiokore.backend.modelo.Promocion;
import com.chiokore.backend.repository.PromocionesRepository;
import com.chiokore.backend.services.ICategoriasService;
import com.chiokore.backend.services.ImageStorageService;
import com.chiokore.backend.services.impl.PromocionService;
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
    private final ICategoriasService categoriasService;

    @GetMapping("/activas")
    public List<Promocion> obtenerPromocionesActivas() {
        return repo.findByActivoTrue();
    }

    @GetMapping("/vigentes")
    public List<Promocion> obtenerPromocionesVigentes() {
        return repo.findActivasVigentes(java.time.LocalDate.now());
    }

    @GetMapping
    public List<Promocion> listarTodas() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Promocion obtenerPorId(@PathVariable Long id) {
        return buscar(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Promocion> crearPromocion(@RequestPart("promocion") Promocion promocion, @RequestPart(value = "imagen", required = false) MultipartFile imagen)  {
        validarPaquete(promocion);
        if (imagen !=null && !imagen.isEmpty()) {
            String nombreImagen = imageStorageService.guardar("promociones", imagen);
            promocion.setUrl_imagen(nombreImagen);
        }
        Promocion guardada = repo.save(promocion);
        return ResponseEntity.ok(guardada);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Promocion> actualizar(@PathVariable Long id, @RequestPart("promocion") Promocion promocion, @RequestPart(value = "imagen", required = false) MultipartFile imagen) {
        validarPaquete(promocion);
        Promocion existente = buscar(id);
        existente.setNombre(promocion.getNombre());
        existente.setDescuento(promocion.getDescuento());
        existente.setCantidadPaquete(promocion.getCantidadPaquete());
        existente.setPrecioPaquete(promocion.getPrecioPaquete());
        existente.setActivo(promocion.isActivo());

        if (promocion.getFechaInicio() != null) {
            existente.setFechaInicio(promocion.getFechaInicio());
        }
        if (promocion.getFechaFin() != null) {
            existente.setFechaFin(promocion.getFechaFin());
        }
        if (promocion.getCategoria() != null && promocion.getCategoria().getId() > 0) {
            existente.setCategoria(categoriasService.obtenerPorId(promocion.getCategoria().getId()));
        }

        String imagenAnterior = existente.getUrl_imagen();
        boolean cambioImagen = imagen != null && !imagen.isEmpty();
        if (cambioImagen) {
            existente.setUrl_imagen(imageStorageService.guardar("promociones", imagen));
        }
        Promocion guardada = repo.save(existente);
        if (cambioImagen) {
            imageStorageService.eliminar(imagenAnterior);
        }
        return ResponseEntity.ok(guardada);
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<Promocion> cambiarActivo(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Promocion promo = buscar(id);
        Boolean activo = body.get("activo");
        if (activo == null) {
            throw new IllegalArgumentException("Debe indicar el campo activo.");
        }
        promo.setActivo(activo);
        return ResponseEntity.ok(repo.save(promo));
    }

    //metodo para exigir que la promocion sea un paquete de verdad
    private void validarPaquete(Promocion promocion) {
        if (promocion.getCantidadPaquete() < PromocionService.MIN_CANTIDAD_PAQUETE) {
            throw new IllegalArgumentException(
                    "La cantidad del paquete debe ser de al menos " + PromocionService.MIN_CANTIDAD_PAQUETE + " piezas.");
        }
        if (promocion.getPrecioPaquete() <= 0) {
            throw new IllegalArgumentException("El precio del paquete debe ser mayor a cero.");
        }
    }

    //metodo para buscar una promocion o avisar que no existe
    private Promocion buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Promocion no encontrada: " + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Promocion promo = repo.findById(id).orElse(null);
        if (promo == null) {
            return ResponseEntity.notFound().build();
        }
        String imagen = promo.getUrl_imagen();
        repo.deleteById(id);
        imageStorageService.eliminar(imagen);
        return ResponseEntity.noContent().build();
    }
}
