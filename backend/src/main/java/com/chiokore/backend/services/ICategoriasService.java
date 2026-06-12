package com.chiokore.backend.services;

import com.chiokore.backend.modelo.Categoria;

import java.util.List;

public interface ICategoriasService {
    List<Categoria> obtenerTodas();
    Categoria obtenerPorId(int id);
    Categoria guardar(Categoria categoria);
    void eliminar(int id);


}
