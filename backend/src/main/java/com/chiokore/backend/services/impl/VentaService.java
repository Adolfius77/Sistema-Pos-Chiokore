package com.chiokore.backend.services.impl;

import lombok.RequiredArgsConstructor;
import com.chiokore.backend.modelo.DetalleVenta;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.modelo.Venta;
import org.pojava.datetime.DateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.chiokore.backend.repository.ProductoRepository;
import com.chiokore.backend.repository.VentaRepository;
import com.chiokore.backend.services.IVentaService;


@Service
@Transactional
@RequiredArgsConstructor
public class VentaService implements IVentaService {
    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;

    @Override
    public Venta agregarDetalle(DetalleVenta detalleVenta, Venta venta) {

        DetalleVenta nuevoDetalle = new DetalleVenta();
        nuevoDetalle.setProducto(detalleVenta.getProducto());
        nuevoDetalle.setCantidad(detalleVenta.getCantidad());
        nuevoDetalle.setPrecio_unitario_capturado(detalleVenta.getPrecio_unitario_capturado());

        nuevoDetalle.setVenta(venta);
        venta.getDetalles().add(nuevoDetalle);

        return ventaRepository.save(venta);
    }

    @Override
    public Venta procesarVenta(Venta venta) {
        venta.setFecha_hora(new DateTime());

        for(DetalleVenta detalleVenta : venta.getDetalles()){

            Producto productoDB = productoRepository.findById((long) detalleVenta.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado durante el cobro"));

            if(productoDB.getStock() < detalleVenta.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + productoDB.getNombre());
            }

            productoDB.setStock(productoDB.getStock() - detalleVenta.getCantidad());
            productoRepository.save(productoDB);
            detalleVenta.setPrecio_unitario_capturado(productoDB.getPrecio());
            detalleVenta.setVenta(venta);
        }

        calcularTotal(venta);
        calcularCambio(venta);

        if(venta.getCambio_entregado() < 0){
            throw new RuntimeException("El monto recibido es insuficiente para cubrir el total.");
        }

        return ventaRepository.save(venta);
    }

    @Override
    public Venta calcularCambio(Venta venta) {
        double cambio = venta.getMonto_recibido() - venta.getTotal();
        venta.setCambio_entregado(cambio);
        return venta;
    }

    @Override
    public Venta calcularTotal(Venta venta) {
        double total = 0.0;
        for (DetalleVenta detalle : venta.getDetalles()) {
            total += detalle.getCantidad() * detalle.getPrecio_unitario_capturado();
        }
        venta.setTotal(total);
        return venta;
    }
}
