package com.chiokore.backend.controllers;

import com.chiokore.backend.dtos.ProductoAdminDTO;
import com.chiokore.backend.dtos.ProductoConPromoDTO;
import com.chiokore.backend.modelo.Categoria;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.modelo.Promocion;
import com.chiokore.backend.services.ICategoriasService;
import com.chiokore.backend.services.IProductoService;
import com.chiokore.backend.services.IPromocionService;
import com.chiokore.backend.services.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {
    private final IProductoService productoService;
    private final ICategoriasService categoriasService;
    private final ImageStorageService imageStorageService;
    private final IPromocionService promocionService;

    @GetMapping("/activos")
    public ResponseEntity<?> obtenerProductos() {
        return ResponseEntity.ok(productoService.obtenerActivos());
    }

    @GetMapping("/categoria/{id}")
    public ResponseEntity<?> obtenerPorCategoria(@PathVariable int id) {
        return ResponseEntity.ok(productoService.encontrarPorCategoria(id));
    }

    @GetMapping("/categoria/{id}/con-promo")
    public ResponseEntity<?> obtenerPorCategoriaConPromo(@PathVariable int id) {
        List<Producto> productos = productoService.encontrarPorCategoria(id);
        LocalDate hoy = LocalDate.now();
        List<ProductoConPromoDTO> resultado = productos.stream().map(p -> {
            double precioOriginal = p.getPrecio();
            double precioFinal = precioOriginal;
            boolean tienePromo = false;
            double descuento = 0;
            String promocionNombre = null;

            if (p.getCategoria() != null) {
                Optional<Promocion> promoOpt = promocionService.buscarPromocionActivaPorCategoria(p.getCategoria().getId(), hoy);
                    if (promoOpt.isPresent()) {
                        Promocion promo = promoOpt.get();
                        promocionNombre = promo.getNombre();

                        if (promo.getCantidadPaquete() > 0 && promo.getPrecioPaquete() > 0 && promo.getPrecioPaquete() < promo.getCantidadPaquete() * precioOriginal) {
                            double precioUnitarioPaquete = promo.getPrecioPaquete() / (double) promo.getCantidadPaquete();
                            precioFinal = Math.round(precioUnitarioPaquete * 100.0) / 100.0;
                            descuento = Math.round((1 - precioFinal / precioOriginal) * 10000.0) / 100.0;
                            if (descuento > 0) tienePromo = true;
                        } else if (promo.getPrecioPromocional() > 0) {
                            precioFinal = Math.round(promo.getPrecioPromocional() * 100.0) / 100.0;
                            descuento = Math.round((1 - precioFinal / precioOriginal) * 10000.0) / 100.0;
                            if (precioFinal < precioOriginal) tienePromo = true;
                        }
                    }
            }

            return ProductoConPromoDTO.builder()
                    .id(p.getId())
                    .nombre(p.getNombre())
                    .precioOriginal(precioOriginal)
                    .precioFinal(precioFinal)
                    .url_imagen(p.getUrl_imagen())
                    .stock(p.getStock())
                    .activo(p.isActivo())
                    .tienePromo(tienePromo)
                    .descuento(descuento)
                    .promocionNombre(promocionNombre)
                    .build();
        }).collect(Collectors.toList());
        return ResponseEntity.ok(resultado);
    }

    @GetMapping
    public ResponseEntity<?> listarTodos() {
        return ResponseEntity.ok(productoService.encontrarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable int id) {
        try {
            return ResponseEntity.ok(productoService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return error(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crear(
            @RequestPart("datos") ProductoAdminDTO datos,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen
    ) {
        try {
            Producto producto = mapearNuevo(datos);
            if (imagen != null && !imagen.isEmpty()) {
                producto.setUrl_imagen(imageStorageService.guardar("productos", imagen));
            }
            Producto guardado = productoService.guardar(producto);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizar(
            @PathVariable int id,
            @RequestPart("datos") ProductoAdminDTO datos,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen
    ) {
        try {
            Producto existente = productoService.obtenerPorId(id);
            aplicarDatos(existente, datos);
            if (imagen != null && !imagen.isEmpty()) {
                existente.setUrl_imagen(imageStorageService.guardar("productos", imagen));
            }
            return ResponseEntity.ok(productoService.guardar(existente));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (RuntimeException e) {
            return error(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<?> cambiarActivo(@PathVariable int id, @RequestBody Map<String, Boolean> body) {
        try {
            Producto producto = productoService.obtenerPorId(id);
            Boolean activo = body.get("activo");
            if (activo == null) {
                return error(HttpStatus.BAD_REQUEST, "Debe indicar el campo activo.");
            }
            producto.setActivo(activo);
            return ResponseEntity.ok(productoService.guardar(producto));
        } catch (RuntimeException e) {
            return error(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    private Producto mapearNuevo(ProductoAdminDTO datos) {
        Producto producto = new Producto();
        aplicarDatos(producto, datos);
        return producto;
    }

    private void aplicarDatos(Producto producto, ProductoAdminDTO datos) {
        if (datos.getNombre() == null || datos.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio.");
        }
        if (datos.getCategoriaId() == null) {
            throw new IllegalArgumentException("La categoría es obligatoria.");
        }
        Categoria categoria = categoriasService.obtenerPorId(datos.getCategoriaId());
        producto.setNombre(datos.getNombre().trim());
        producto.setPrecio(datos.getPrecio());
        producto.setStock(datos.getStock());
        producto.setActivo(datos.isActivo());
        producto.setEs_Unico(datos.isEsUnico());
        producto.setCategoria(categoria);
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String mensaje) {
        Map<String, String> body = new HashMap<>();
        body.put("mensaje", mensaje);
        body.put("error", mensaje);
        return ResponseEntity.status(status).body(body);
    }
}
