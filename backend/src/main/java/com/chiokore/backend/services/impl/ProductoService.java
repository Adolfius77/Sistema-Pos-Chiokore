package com.chiokore.backend.services.impl;

import com.chiokore.backend.Exceptions.RecursoNoEncontradoException;
import com.chiokore.backend.Exceptions.ReglaNegocioException;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.repository.DetalleVentaRepository;
import com.chiokore.backend.repository.ProductoRepository;
import com.chiokore.backend.services.IProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductoService implements IProductoService {
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ProductoService.class);
    private final ProductoRepository productoRepository;
    private final DetalleVentaRepository detalleVentaRepository;

    @Override
    public List<Producto> encontrarTodos() {
        logger.info("Encontrando todas las productos");
        return productoRepository.findAll();
    }


    @Override
    public List<Producto> encontrarPorCategoria(int id) {
        logger.info("Encontrando todas las productos por categoria {}", id);
        return productoRepository.findByCategoriaId((long) id).stream()
                .filter(Producto::isActivo)
                .collect(Collectors.toList());
    }

    @Override
    public List<Producto> obtenerActivos() {
        logger.info("Obteniendo todos los productos activos");
        return productoRepository.findByActivoTrue();
    }

    @Override
    public Producto guardar(Producto producto) {
        logger.info("Guardando el producto id={}", producto.getId());
       return productoRepository.save(producto);
    }

    @Override
    public Producto obtenerPorId(int id) {
        logger.info("Obteniendo el producto id={}", id);
        return productoRepository.findById((long) id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + id));
    }

    @Override
    public void eliminar(int id) {
        if(!productoRepository.existsById((long)id)){
            logger.error("El producto no existe");
            throw new RecursoNoEncontradoException("Producto no encontrado: " + id);
        }
        // detalle_venta apunta a productos con una FK sin ON DELETE: borrar un
        // producto ya vendido reventaria la insercion o dejaria el historial de
        // ventas inconsistente. En ese caso el producto se desactiva, no se borra.
        if (detalleVentaRepository.existsByProductoId(id)) {
            logger.warn("No se puede eliminar el producto id={}: tiene ventas registradas", id);
            throw new ReglaNegocioException(
                    "Este producto ya tiene ventas registradas y no se puede eliminar. Desactívalo para quitarlo del catálogo.");
        }
        logger.info("Eliminando el producto id={}", id);
        productoRepository.deleteById((long)id);
    }
}
