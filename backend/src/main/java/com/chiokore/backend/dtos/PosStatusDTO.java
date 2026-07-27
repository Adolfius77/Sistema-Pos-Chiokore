package com.chiokore.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PosStatusDTO {
    private Long id;
    private String nombre;
    private String rol;
    private boolean activo;
    private boolean marcoAsistencia;
}
