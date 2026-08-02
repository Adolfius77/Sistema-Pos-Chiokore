package com.chiokore.backend.services.impl;

import com.chiokore.backend.controllers.ventaController;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.repository.ProductoRepository;
import com.chiokore.backend.services.IProductoService;
import lombok.NoArgsConstructor;
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
        return productoRepository.findAll().stream()
                .filter(Producto::isActivo)
                .collect(Collectors.toList());
    }

    @Override
    public Producto guardar(Producto producto) {
        logger.info("Guardando el producto id={}", producto.getId());
       return productoRepository.save(producto);
    }

    @Override
    public Producto obtenerPorId(int id) {
        logger.info("Obteniendo el producto id={}", id);
        return productoRepository.findById((long)id).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    @Override
    public void eliminar(int id) {
        if(!productoRepository.existsById((long)id)){
            logger.error("El producto no existe");
            throw new RuntimeException("Producto no encontrado");
        }
        logger.info("Eliminando el producto id={}", id);
        productoRepository.deleteById((long)id);
    }
}
