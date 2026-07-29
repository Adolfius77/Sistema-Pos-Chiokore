package com.chiokore.backend.services;

import com.chiokore.backend.modelo.Promocion;

import java.time.LocalDate;
import java.util.Optional;

public interface IPromocionService {
    Optional<Promocion> buscarPromocionActivaPorCategoria(int categoriaId, LocalDate fecha);
}