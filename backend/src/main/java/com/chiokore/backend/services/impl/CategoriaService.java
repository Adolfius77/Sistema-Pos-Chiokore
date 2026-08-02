package com.chiokore.backend.services.impl;

import com.chiokore.backend.controllers.ventaController;
import com.chiokore.backend.modelo.Categoria;
import com.chiokore.backend.repository.CategoriaRepository;
import com.chiokore.backend.services.ICategoriasService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CategoriaService implements ICategoriasService {
    private final CategoriaRepository categoriaRepository;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(CategoriaService.class);

    @Override
    public List<Categoria> obtenerTodas() {
        logger.info("Obteniendo todas las categorias");
        return categoriaRepository.findAll();
    }

    @Override
    public Categoria obtenerPorId(int id) {
        logger.info("Obteniendo la categoria con id={}", id);
        return categoriaRepository.findById((long)id).orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
    }

    @Override
    public Categoria guardar(Categoria categoria) {
        logger.info("Guardando la categoria");
        return categoriaRepository.save(categoria);
    }

    @Override
    public void eliminar(int id) {
        if(!categoriaRepository.existsById((long)id)){
            throw new RuntimeException("Categoria no encontrada");
        }
        logger.info("Eliminando la categoria con id={}", id);
        categoriaRepository.deleteById((long)id);
    }
}
