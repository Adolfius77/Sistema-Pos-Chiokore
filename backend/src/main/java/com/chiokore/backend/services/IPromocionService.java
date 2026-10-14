package com.chiokore.backend.services;

import com.chiokore.backend.modelo.Promocion;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.dtos.PromocionAplicadaDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IPromocionService {
    Optional<Promocion> buscarPromocionActivaPorCategoria(int categoriaId, LocalDate fecha);
    List<Promocion> buscarPromocionesVigentesPorCategoria(int categoriaId, LocalDate fecha);
    PromocionAplicadaDTO calcularPromocionAplicada(Producto producto, LocalDate fecha);
    PromocionAplicadaDTO calcularPromocionAplicada(Producto producto, int cantidad, LocalDate fecha);
    PromocionAplicadaDTO calcularPromocionCatalogo(Producto producto, LocalDate fecha);
}