package com.chiokore.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromocionAplicadaDTO {
    private boolean tienePromo;
    private String tipoPromocion;
    private double precioFinal;
    private double montoAplicado;
    private double descuento;
    private String promocionNombre;
    private int cantidadPaquete;
    private double precioPaquete;
}
