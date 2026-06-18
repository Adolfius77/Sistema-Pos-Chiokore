package com.chiokore.backend.repository;

import com.chiokore.backend.modelo.Categoria;
import com.chiokore.backend.modelo.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository  extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findByNombre(String nombre);
    List<Producto> findCategoriaById(Long id);
}
