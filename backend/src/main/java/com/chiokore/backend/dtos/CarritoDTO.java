package com.chiokore.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.chiokore.backend.modelo.DetalleVenta;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarritoDTO {
    private String usuario_id;
    private double total;
    private List<DetalleVenta> items = new ArrayList<>();

}
