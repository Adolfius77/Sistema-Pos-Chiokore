package com.chiokore.backend.services;

import com.chiokore.backend.dtos.CobroDTO;
import com.chiokore.backend.dtos.VentaDiaDTO;
import com.chiokore.backend.dtos.VentaResumenDTO;
import com.chiokore.backend.dtos.VentasResumenDTO;
import com.chiokore.backend.modelo.Venta;

import java.time.LocalDate;
import java.util.List;

public interface IVentaService {
    Venta procesarVenta(CobroDTO cobroDTO, Long idTrabajador);

    Venta procesarVenta(CobroDTO cobroDTO, Long idTrabajador, String urlComprobante);

    VentasResumenDTO resumen(LocalDate desde, LocalDate hasta);

    List<VentaDiaDTO> ventasPorDia(LocalDate desde, LocalDate hasta);

    List<Venta> listarPorFecha(LocalDate fecha);

    Venta obtenerDetalle(int id);

    VentaResumenDTO resumenPorFecha(LocalDate fecha);
}
