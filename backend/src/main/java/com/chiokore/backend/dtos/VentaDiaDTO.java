package com.chiokore.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Ventas COMPLETADAS de un dia. Para la grafica de ventas diarias. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaDiaDTO {
    private LocalDate fecha;
    private long numeroVentas;
    private double totalVentas;
}
