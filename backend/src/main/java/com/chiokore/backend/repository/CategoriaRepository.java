package com.chiokore.backend.repository;

import com.chiokore.backend.modelo.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoriaRepository  extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findByNombre(String nombre);
}
