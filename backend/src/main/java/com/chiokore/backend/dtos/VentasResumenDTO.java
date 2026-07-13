package com.chiokore.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Resumen de ventas COMPLETADAS en un rango de fechas.
 * Lo consume el modulo de Nomina para los reportes financieros.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentasResumenDTO {
    private LocalDate desde;
    private LocalDate hasta;
    private long numeroVentas;
    private double totalVentas;
}
