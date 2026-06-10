package dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import modelo.DetalleVenta;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class CarritoDTO {
    private String usuario_id;
    private double total;
    private List<DetalleVenta> items = new ArrayList<>();

}
