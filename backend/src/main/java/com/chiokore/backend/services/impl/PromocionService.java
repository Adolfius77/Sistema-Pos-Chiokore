package com.chiokore.backend.services.impl;

import com.chiokore.backend.dtos.PromocionAplicadaDTO;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.modelo.Promocion;
import com.chiokore.backend.repository.PromocionesRepository;
import com.chiokore.backend.services.IPromocionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PromocionService implements IPromocionService {

    // Un "paquete" de 1 seria un descuento por pieza suelta disfrazado, y las
    // promociones de este POS solo premian llevar el paquete completo.
    public static final int MIN_CANTIDAD_PAQUETE = 2;

    private final PromocionesRepository repo;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PromocionService.class);

    @Override
    public Optional<Promocion> buscarPromocionActivaPorCategoria(int categoriaId, LocalDate fecha) {
        logger.info("Buscando promocion activa por categoria");
        return buscarPromocionesVigentesPorCategoria(categoriaId, fecha).stream().findFirst();
    }

    @Override
    public List<Promocion> buscarPromocionesVigentesPorCategoria(int categoriaId, LocalDate fecha) {
        logger.info("Buscando promociones vigentes por categoria");
        return repo.findActivasVigentesPorCategoria(categoriaId, fecha);
    }

    @Override
    public PromocionAplicadaDTO calcularPromocionAplicada(Producto producto, LocalDate fecha) {
        return calcularPromocionAplicada(producto, 1, fecha);
    }

    @Override
    public PromocionAplicadaDTO calcularPromocionAplicada(Producto producto, int cantidad, LocalDate fecha) {
        double precioBase = producto.getPrecio();
        if (producto.getCategoria() == null) {
            return sinPromocion(precioBase, cantidad);
        }

        List<Promocion> promociones = buscarPromocionesVigentesPorCategoria(producto.getCategoria().getId(), fecha);
        if (promociones.isEmpty()) {
            return sinPromocion(precioBase, cantidad);
        }

        PromocionAplicadaDTO mejor = null;
        for (Promocion promo : promociones) {
            PromocionAplicadaDTO candidata = evaluarPromocion(promo, precioBase, cantidad);
            if (candidata == null) {
                continue;
            }
            if (mejor == null || candidata.getMontoAplicado() < mejor.getMontoAplicado()) {
                mejor = candidata;
            }
        }

        return mejor != null ? mejor : sinPromocion(precioBase, cantidad);
    }

    /**
     * Lo que anuncia la ficha del catalogo. La pieza suelta siempre vale el precio
     * de lista, asi que aqui solo se elige que paquete ofrecer.
     */
    @Override
    public PromocionAplicadaDTO calcularPromocionCatalogo(Producto producto, LocalDate fecha) {
        double precioBase = producto.getPrecio();
        PromocionAplicadaDTO base = sinPromocion(precioBase, 1);
        if (producto.getCategoria() == null) {
            return base;
        }

        Promocion mejorPaquete = null;
        for (Promocion promo : buscarPromocionesVigentesPorCategoria(producto.getCategoria().getId(), fecha)) {
            // Se evalua con la cantidad justa del paquete: asi se descarta el que
            // ni siquiera con el paquete completo sale mas barato que el precio de lista.
            if (!paqueteAplicable(promo, precioBase, promo.getCantidadPaquete())) {
                continue;
            }
            if (mejorPaquete == null || unitarioDePaquete(promo) < unitarioDePaquete(mejorPaquete)) {
                mejorPaquete = promo;
            }
        }

        if (mejorPaquete == null) {
            return base;
        }

        base.setTienePromo(true);
        base.setTipoPromocion("PAQUETE");
        base.setPromocionNombre(mejorPaquete.getNombre());
        base.setCantidadPaquete(mejorPaquete.getCantidadPaquete());
        base.setPrecioPaquete(redondear2(mejorPaquete.getPrecioPaquete()));
        base.setDescuento(redondear2(calcularDescuento(precioBase, unitarioDePaquete(mejorPaquete))));
        return base;
    }

    //metodo para obtener el precio por unidad de un paquete
    private double unitarioDePaquete(Promocion promo) {
        return promo.getPrecioPaquete() / (double) promo.getCantidadPaquete();
    }

    /**
     * El descuento SOLO existe cuando se completa el paquete: las piezas sueltas,
     * y el resto que no alcanza a formar otro paquete, se cobran a precio de lista.
     */
    private PromocionAplicadaDTO evaluarPromocion(Promocion promo, double precioBase, int cantidad) {
        if (!paqueteAplicable(promo, precioBase, cantidad)) {
            return null;
        }

        int paquetes = cantidad / promo.getCantidadPaquete();
        int resto = cantidad % promo.getCantidadPaquete();
        double montoAplicado = redondear2((paquetes * promo.getPrecioPaquete()) + (resto * precioBase));
        double precioFinal = redondear2(montoAplicado / cantidad);
        double descuento = calcularDescuento(precioBase, precioFinal);
        return construirRespuesta(promo, "PAQUETE", precioFinal, montoAplicado, descuento);
    }

    //metodo para saber si el paquete existe, conviene y alcanza con esa cantidad
    private boolean paqueteAplicable(Promocion promo, double precioBase, int cantidad) {
        return promo.getCantidadPaquete() >= MIN_CANTIDAD_PAQUETE
                && promo.getPrecioPaquete() > 0
                && cantidad >= promo.getCantidadPaquete()
                && promo.getPrecioPaquete() < promo.getCantidadPaquete() * precioBase;
    }

    private PromocionAplicadaDTO construirRespuesta(Promocion promo, String tipoPromocion, double precioFinal, double montoAplicado, double descuento) {
        return PromocionAplicadaDTO.builder()
                .tienePromo(true)
                .tipoPromocion(tipoPromocion)
                .precioFinal(precioFinal)
                .montoAplicado(montoAplicado)
                .descuento(redondear2(descuento))
                .promocionNombre(promo.getNombre())
                .cantidadPaquete(promo.getCantidadPaquete())
                .precioPaquete(redondear2(promo.getPrecioPaquete()))
                .build();
    }

    private PromocionAplicadaDTO sinPromocion(double precioBase, int cantidad) {
        return PromocionAplicadaDTO.builder()
                .tienePromo(false)
                .precioFinal(redondear2(precioBase))
                .montoAplicado(redondear2(precioBase * cantidad))
                .build();
    }

    private double calcularDescuento(double precioBase, double precioFinal) {
        if (precioBase <= 0) {
            return 0.0;
        }
        return (1 - (precioFinal / precioBase)) * 100.0;
    }

    private double redondear2(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}