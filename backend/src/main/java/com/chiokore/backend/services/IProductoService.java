package com.chiokore.backend.services;

import com.chiokore.backend.modelo.Producto;

import java.util.List;

public interface IProductoService {
    List<Producto> encontrarTodos();
    List<Producto> encontrarPorCategoria(int id);
    List<Producto> obtenerActivos();
    Producto guardar(Producto producto);
    Producto obtenerPorId(int id);
    void eliminar(int id);
}
