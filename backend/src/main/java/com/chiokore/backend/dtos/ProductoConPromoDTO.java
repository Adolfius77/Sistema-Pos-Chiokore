package com.chiokore.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoConPromoDTO {
    private int id;
    private String nombre;
    private double precioOriginal;
    private double precioFinal;
    private String url_imagen;
    private int stock;
    private boolean activo;
    private boolean tienePromo;
    private double descuento;
    private String promocionNombre;
}
