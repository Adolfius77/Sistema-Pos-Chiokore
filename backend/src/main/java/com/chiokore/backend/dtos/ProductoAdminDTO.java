package com.chiokore.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoAdminDTO {
    private String nombre;
    private double precio;
    private int stock;
    private Integer categoriaId;
    private boolean activo;
    private boolean esUnico;
}
