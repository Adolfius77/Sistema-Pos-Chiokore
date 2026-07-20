package com.chiokore.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaResumenDTO {
    private long numVentas;
    private double totalGeneral;
    private double totalEfectivo;
    private double totalTarjeta;
    private long productosStockBajo;
}
