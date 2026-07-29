package com.chiokore.backend.services.impl;

import com.chiokore.backend.modelo.Promocion;
import com.chiokore.backend.repository.PromocionesRepository;
import com.chiokore.backend.services.IPromocionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PromocionService implements IPromocionService {

    private final PromocionesRepository repo;

    @Override
    public Optional<Promocion> buscarPromocionActivaPorCategoria(int categoriaId, LocalDate fecha) {
        return repo.findActivaByCategoriaAndFecha(categoriaId, fecha);
    }
}