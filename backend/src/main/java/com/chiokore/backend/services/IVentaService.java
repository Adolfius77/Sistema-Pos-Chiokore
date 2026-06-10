package com.chiokore.backend.services;

import com.chiokore.backend.modelo.DetalleVenta;
import com.chiokore.backend.modelo.Venta;

public interface IVentaService {
    Venta agregarDetalle(DetalleVenta detalleVenta, Venta venta);
    Venta procesarVenta(Venta venta);
    Venta calcularCambio(Venta venta);
    Venta calcularTotal(Venta venta);
}
