package com.chiokore.backend.Factorys;

import com.chiokore.backend.dtos.CobroDTO;
import com.chiokore.backend.modelo.DetalleVenta;
import com.chiokore.backend.modelo.EstadoVenta;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.modelo.Venta;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

import java.util.List;

@Component
public class VentaFactory {
    public DetalleVenta crearDetalle(Producto producto, int cantidad, double precioUnitario){
        DetalleVenta detalle = new DetalleVenta();
        detalle.setProducto(producto);
        detalle.setCantidad(cantidad);
        detalle.setPrecio_unitario_capturado(precioUnitario);
        return detalle;
    }
    public Venta crearVenta(CobroDTO cobro, List<DetalleVenta> detalles, double total){
        Venta venta = new Venta();

        venta.setMetodo_pago(cobro.getMetodoPago());
        venta.setMonto_recibido(cobro.getMontoRecibido());
        venta.setFecha_hora(LocalDateTime.now());
        venta.setDetalles(detalles);
        venta.setReferencia(cobro.getReferencia());

        // Recalcular total a partir de los detalles para evitar inconsistencias
        double recalculado = detalles.stream().mapToDouble(d -> d.getCantidad() * d.getPrecio_unitario_capturado()).sum();
        venta.setTotal(recalculado);
        if (cobro.getMontoRecibido() < recalculado) {
            // Pago parcial: marcar como PENDIENTE y no entregar cambio
            venta.setEstado(EstadoVenta.PENDIENTE);
            venta.setCambio_entregado(0.0);
        } else {
            venta.setEstado(EstadoVenta.COMPLETADA);
            venta.setCambio_entregado(cobro.getMontoRecibido() - recalculado);
        }

        detalles.forEach(d -> d.setVenta(venta));
        return venta;
    }
}
