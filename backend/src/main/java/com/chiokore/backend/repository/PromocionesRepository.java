package com.chiokore.backend.repository;


import com.chiokore.backend.modelo.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromocionesRepository  extends JpaRepository<Promocion, Long> {
    List<Promocion> findByActivoTrue();

    @Query("SELECT p FROM Promocion p WHERE p.activo = true AND p.categoria.id = :categoriaId AND :fecha BETWEEN p.fechaInicio AND p.fechaFin")
    Optional<Promocion> findActivaByCategoriaAndFecha(int categoriaId, LocalDate fecha);
}
