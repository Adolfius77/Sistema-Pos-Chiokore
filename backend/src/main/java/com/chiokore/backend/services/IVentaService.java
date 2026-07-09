package com.chiokore.backend.services;

import com.chiokore.backend.dtos.CobroDTO;
import com.chiokore.backend.modelo.Venta;

public interface IVentaService {
    Venta procesarVenta(CobroDTO cobroDTO, Long idTrabajador);

}
