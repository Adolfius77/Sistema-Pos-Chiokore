package com.chiokore.backend.services;

import com.chiokore.backend.Exceptions.ReglaNegocioException;
import com.chiokore.backend.dtos.CobroDTO;
import com.chiokore.backend.dtos.ItemDto;
import com.chiokore.backend.modelo.Categoria;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.modelo.Venta;
import com.chiokore.backend.repository.CategoriaRepository;
import com.chiokore.backend.repository.ProductoRepository;
import com.chiokore.backend.servidor.BackendApplication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(classes = BackendApplication.class)
@ActiveProfiles("test")
class VentaServiceTest {

    @Autowired
    private IVentaService ventaService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    private Producto producto;

    @BeforeEach
    void prepararCatalogo() {
        Categoria categoria = new Categoria();
        categoria.setNombre("Pruebas " + System.nanoTime());
        categoria = categoriaRepository.save(categoria);

        producto = new Producto();
        producto.setNombre("Producto de prueba");
        producto.setPrecio(100.0);
        producto.setStock(10);
        producto.setActivo(true);
        producto.setEs_Unico(false);
        producto.setCategoria(categoria);
        producto = productoRepository.save(producto);
    }

    private CobroDTO cobroCon(int cantidad, double montoRecibido) {
        CobroDTO cobro = new CobroDTO();
        cobro.setMetodoPago("EFECTIVO");
        cobro.setMontoRecibido(montoRecibido);
        cobro.setItems(List.of(new ItemDto(producto.getId(), cantidad, producto.getPrecio())));
        return cobro;
    }

    @Test
    void cobraYDescuentaStock() {
        Venta venta = ventaService.procesarVenta(cobroCon(2, 200.0), 1L, null, "Cajero", "Test", "127.0.0.1");

        assertEquals(200.0, venta.getTotal());
        assertEquals(8, productoRepository.findById((long) producto.getId()).orElseThrow().getStock());
    }

    /**
     * Antes del arreglo, una cantidad negativa pasaba el chequeo de stock
     * (10 < -5 es falso), AUMENTABA las existencias y restaba del total de la
     * venta, permitiendo cobrar de menos.
     */
    @Test
    void rechazaCantidadNegativa() {
        assertThrows(IllegalArgumentException.class,
                () -> ventaService.procesarVenta(cobroCon(-5, 0.0), 1L, null, "Cajero", "Test", "127.0.0.1"));

        assertEquals(10, productoRepository.findById((long) producto.getId()).orElseThrow().getStock(),
                "el stock no debe moverse si la venta fue rechazada");
    }

    @Test
    void rechazaCantidadCero() {
        assertThrows(IllegalArgumentException.class,
                () -> ventaService.procesarVenta(cobroCon(0, 0.0), 1L, null, "Cajero", "Test", "127.0.0.1"));
    }

    @Test
    void rechazaVentaSinProductos() {
        CobroDTO cobro = new CobroDTO();
        cobro.setMetodoPago("EFECTIVO");
        cobro.setMontoRecibido(100.0);
        cobro.setItems(List.of());

        assertThrows(IllegalArgumentException.class,
                () -> ventaService.procesarVenta(cobro, 1L, null, "Cajero", "Test", "127.0.0.1"));
    }

    @Test
    void rechazaStockInsuficiente() {
        assertThrows(ReglaNegocioException.class,
                () -> ventaService.procesarVenta(cobroCon(99, 9900.0), 1L, null, "Cajero", "Test", "127.0.0.1"));
    }

    @Test
    void exigeTicketEnCobroConTarjeta() {
        CobroDTO cobro = cobroCon(1, 100.0);
        cobro.setMetodoPago("TARJETA");

        assertThrows(IllegalArgumentException.class,
                () -> ventaService.procesarVenta(cobro, 1L, null, "Cajero", "Test", "127.0.0.1"));
    }
}
