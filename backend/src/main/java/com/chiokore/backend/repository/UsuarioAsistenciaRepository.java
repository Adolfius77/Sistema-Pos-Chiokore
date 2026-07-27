package com.chiokore.backend.repository;

import com.chiokore.backend.modelo.usuario_asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioAsistenciaRepository  extends JpaRepository<usuario_asistencia, Long> {
}
