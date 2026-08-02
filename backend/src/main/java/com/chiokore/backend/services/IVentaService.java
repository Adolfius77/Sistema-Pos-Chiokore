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
    Venta procesarVenta(
            CobroDTO cobroDTO,
            Long idTrabajador,
            String urlComprobante,
            String cajeroNombre,
            String dispositivoModelo,
            String ipOrigen
    );

    VentasResumenDTO resumen(LocalDate desde, LocalDate hasta);

    List<VentaDiaDTO> ventasPorDia(LocalDate desde, LocalDate hasta);

    List<Venta> listarPorFecha(LocalDate fecha);

    List<Venta> listarPorRango(LocalDate desde, LocalDate hasta);

    Venta obtenerDetalle(int id);

    Venta cancelarVenta(int id);

    VentaResumenDTO resumenPorFecha(LocalDate fecha);

    byte[] generarReporteExcel(LocalDate desde, LocalDate hasta);

    // Utilities to repair/calibrate totals from stored detalle_venta data
    int recalcularTotales();

    Venta recalcularVenta(int id);

    int recalcularPrecios();

    Venta recalcularPreciosVenta(int id);
}
