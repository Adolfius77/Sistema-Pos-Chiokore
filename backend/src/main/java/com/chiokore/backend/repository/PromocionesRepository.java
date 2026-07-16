package com.chiokore.backend.repository;

import com.chiokore.backend.modelo.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromocionesRepository  extends JpaRepository<Promocion, Integer> {
    List<Promocion> findByActivoTrue();
}
