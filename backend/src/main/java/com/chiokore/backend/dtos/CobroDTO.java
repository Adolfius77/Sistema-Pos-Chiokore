package com.chiokore.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CobroDTO {
    private String metodoPago;
    private double montoRecibido;
    private String referencia;
    private List<ItemDto> items;
}
