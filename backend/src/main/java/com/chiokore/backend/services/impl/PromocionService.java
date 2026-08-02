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
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PromocionService.class);

    @Override
    public Optional<Promocion> buscarPromocionActivaPorCategoria(int categoriaId, LocalDate fecha) {
        logger.info("Buscando promocion activa por categoria");
        return repo.findActivaByCategoriaAndFecha(categoriaId, fecha);
    }
}