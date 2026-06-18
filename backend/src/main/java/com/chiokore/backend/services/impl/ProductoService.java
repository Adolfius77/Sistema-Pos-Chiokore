package com.chiokore.backend.services.impl;

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

    private final ProductoRepository productoRepository;

    @Override
    public List<Producto> encontrarTodos() {
        return productoRepository.findAll();
    }


    @Override
    public List<Producto> encontrarPorCategoria(int id) {
        return productoRepository.findByCategoriaId((long) id).stream()
                .filter(Producto::isActivo)
                .collect(Collectors.toList());
    }

    @Override
    public List<Producto> obtenerActivos() {
        return productoRepository.findAll().stream()
                .filter(Producto::isActivo)
                .collect(Collectors.toList());
    }

    @Override
    public Producto guardar(Producto producto) {
       return productoRepository.save(producto);
    }

    @Override
    public Producto obtenerPorId(int id) {
        return productoRepository.findById((long)id).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    @Override
    public void eliminar(int id) {
        if(!productoRepository.existsById((long)id)){
            throw new RuntimeException("Producto no encontrado");
        }
        productoRepository.deleteById((long)id);
    }
}
