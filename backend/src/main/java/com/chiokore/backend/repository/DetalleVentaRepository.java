package com.chiokore.backend.repository;

import com.chiokore.backend.modelo.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {
    Optional<DetalleVenta> findById(Long aLong);
}
