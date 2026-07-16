package com.chiokore.backend.controllers;

import com.chiokore.backend.modelo.Promocion;
import com.chiokore.backend.repository.PromocionesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/promociones")
@RequiredArgsConstructor
public class PromocionController {
    private final PromocionesRepository repo;

    @GetMapping("/activas")
    public List<Promocion> obtenerPromocionesActivas() {
        return repo.findByActivoTrue();
    }
}
