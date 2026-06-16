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
    public DetalleVenta crearDetalle(Producto producto, int cantidad){
        DetalleVenta detalle = new DetalleVenta();
        detalle.setProducto(producto);
        detalle.setCantidad(cantidad);
        detalle.setPrecio_unitario_capturado(producto.getPrecio());
        return detalle;
    }
    public Venta crearVenta(CobroDTO cobro, List<DetalleVenta> detalles, double total){
        Venta venta = new Venta();
        venta.setUsuario_id(cobro.getUsuario_id());
        venta.setMetodo_pago(cobro.getMetodoPago());
        venta.setMonto_recibido(cobro.getMontoRecibido());
        venta.setEstado(EstadoVenta.COMPLETADA);
        venta.setFecha_hora(LocalDateTime.now());
        venta.setDetalles(detalles);
        venta.setTotal(total);
        venta.setCambio_entregado(cobro.getMontoRecibido() - total);

        detalles.forEach(d -> d.setVenta(venta));
        return venta;
    }
}
