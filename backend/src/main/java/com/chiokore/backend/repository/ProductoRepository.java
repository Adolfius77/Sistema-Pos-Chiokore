package com.chiokore.backend.repository;

import com.chiokore.backend.modelo.Categoria;
import com.chiokore.backend.modelo.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findByNombre(String nombre);
    Optional<Producto> findByCategoria(Categoria categoria);

    List<Producto> findByCategoriaId(Long id);
}
