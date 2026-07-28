package com.chiokore.backend.repository;

import com.chiokore.backend.modelo.usuario_asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsuarioAsistenciaRepository extends JpaRepository<usuario_asistencia, Long> {
    List<usuario_asistencia> findByActivoTrue();
    List<usuario_asistencia> findByActivoAndMarcoAsistencia(boolean activo, boolean marcoAsistencia);
}
