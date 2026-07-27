package com.chiokore.backend.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "usuario_asistencia")
public class usuario_asistencia {
    @Id
    @Column(name="id_asistencia", nullable = false)
    private Long idAsistencia;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "rol", nullable = false)
    private String rol;

    @Column(name="activo", nullable = false)
    private boolean activo;

    @Column(name = "marco_asistencia", nullable = false)
    private boolean marcoAsistencia;
}
