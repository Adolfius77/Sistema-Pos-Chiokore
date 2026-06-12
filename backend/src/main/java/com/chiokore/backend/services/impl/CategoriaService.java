package com.chiokore.backend.services.impl;

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
    @Override
    public List<Categoria> obtenerTodas() {
        return categoriaRepository.findAll();
    }

    @Override
    public Categoria obtenerPorId(int id) {
        return categoriaRepository.findById((long)id).orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
    }

    @Override
    public Categoria guardar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @Override
    public void eliminar(int id) {
        if(!categoriaRepository.existsById((long)id)){
            throw new RuntimeException("Categoria no encontrada");
        }
        categoriaRepository.deleteById((long)id);
    }
}
