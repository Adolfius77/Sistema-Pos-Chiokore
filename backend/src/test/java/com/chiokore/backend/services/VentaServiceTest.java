package com.chiokore.backend.services;

import com.chiokore.backend.Exceptions.ReglaNegocioException;
import com.chiokore.backend.dtos.CobroDTO;
import com.chiokore.backend.dtos.ItemDto;
import com.chiokore.backend.modelo.Categoria;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.modelo.Promocion;
import com.chiokore.backend.modelo.Venta;
import com.chiokore.backend.repository.CategoriaRepository;
import com.chiokore.backend.repository.ProductoRepository;
import com.chiokore.backend.repository.PromocionesRepository;
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

    @Autowired
    private PromocionesRepository promocionesRepository;

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

    @Test
    void aplicaPromocionPorPaqueteEnLaVenta() {
        Promocion promo = new Promocion();
        promo.setNombre("Paquete de prueba");
        promo.setCategoria(producto.getCategoria());
        promo.setActivo(true);
        promo.setFechaInicio(java.time.LocalDate.now().minusDays(1));
        promo.setFechaFin(java.time.LocalDate.now().plusDays(1));
        promo.setCantidadPaquete(3);
        promo.setPrecioPaquete(240.0);
        promocionesRepository.save(promo);

        Venta venta = ventaService.procesarVenta(cobroCon(3, 240.0), 1L, null, "Cajero", "Test", "127.0.0.1");

        assertEquals(240.0, venta.getTotal());
        assertEquals(7, productoRepository.findById((long) producto.getId()).orElseThrow().getStock());
    }

    @Test
    void eligeLaMejorPromocionEntreVariasDeLaMismaCategoria() {
        Promocion paquete = new Promocion();
        paquete.setNombre("Paquete");
        paquete.setCategoria(producto.getCategoria());
        paquete.setActivo(true);
        paquete.setFechaInicio(java.time.LocalDate.now().minusDays(1));
        paquete.setFechaFin(java.time.LocalDate.now().plusDays(1));
        paquete.setCantidadPaquete(3);
        paquete.setPrecioPaquete(240.0);
        promocionesRepository.save(paquete);

        Promocion peor = new Promocion();
        peor.setNombre("Paquete peor");
        peor.setCategoria(producto.getCategoria());
        peor.setActivo(true);
        peor.setFechaInicio(java.time.LocalDate.now().minusDays(1));
        peor.setFechaFin(java.time.LocalDate.now().plusDays(1));
        peor.setCantidadPaquete(3);
        peor.setPrecioPaquete(280.0);
        promocionesRepository.save(peor);

        Venta venta = ventaService.procesarVenta(cobroCon(3, 240.0), 1L, null, "Cajero", "Test", "127.0.0.1");

        assertEquals(240.0, venta.getTotal());
        assertEquals(7, productoRepository.findById((long) producto.getId()).orElseThrow().getStock());
    }

    //metodo para dejar vigente un paquete de 2 piezas por 120
    private void promoDePaquete() {
        Promocion promo = new Promocion();
        promo.setNombre("2 por 120");
        promo.setCategoria(producto.getCategoria());
        promo.setActivo(true);
        promo.setFechaInicio(java.time.LocalDate.now().minusDays(1));
        promo.setFechaFin(java.time.LocalDate.now().plusDays(1));
        promo.setCantidadPaquete(2);
        promo.setPrecioPaquete(120.0);
        promocionesRepository.save(promo);
    }

    /**
     * El descuento solo existe con el paquete completo: una pieza suelta se cobra
     * al precio de lista aunque la promocion este vigente.
     */
    @Test
    void noDescuentaLaPiezaSuelta() {
        promoDePaquete();

        Venta venta = ventaService.procesarVenta(cobroCon(1, 100.0), 1L, null, "Cajero", "Test", "127.0.0.1");

        assertEquals(100.0, venta.getTotal());
    }

    @Test
    void aplicaElDescuentoAlCompletarElPaquete() {
        promoDePaquete();

        Venta venta = ventaService.procesarVenta(cobroCon(2, 120.0), 1L, null, "Cajero", "Test", "127.0.0.1");

        assertEquals(120.0, venta.getTotal());
    }

    @Test
    void cobraAPrecioDeListaElRestoQueNoCompletaOtroPaquete() {
        promoDePaquete();

        Venta venta = ventaService.procesarVenta(cobroCon(3, 220.0), 1L, null, "Cajero", "Test", "127.0.0.1");

        assertEquals(220.0, venta.getTotal());
    }

    /**
     * Un paquete que no baja del precio de lista no debe encarecer la venta.
     */
    @Test
    void ignoraElPaqueteQueNoRebaja() {
        Promocion promo = new Promocion();
        promo.setNombre("Paquete sin rebaja");
        promo.setCategoria(producto.getCategoria());
        promo.setActivo(true);
        promo.setFechaInicio(java.time.LocalDate.now().minusDays(1));
        promo.setFechaFin(java.time.LocalDate.now().plusDays(1));
        promo.setCantidadPaquete(2);
        promo.setPrecioPaquete(260.0);
        promocionesRepository.save(promo);

        Venta venta = ventaService.procesarVenta(cobroCon(2, 200.0), 1L, null, "Cajero", "Test", "127.0.0.1");

        assertEquals(200.0, venta.getTotal());
    }
}
