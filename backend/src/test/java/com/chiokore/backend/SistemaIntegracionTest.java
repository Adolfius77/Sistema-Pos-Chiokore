package com.chiokore.backend;

import com.chiokore.backend.config.JwtService;
import com.chiokore.backend.dtos.CobroDTO;
import com.chiokore.backend.dtos.ItemDto;
import com.chiokore.backend.dtos.ProductoAdminDTO;
import com.chiokore.backend.modelo.Categoria;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.modelo.Promocion;
import com.chiokore.backend.repository.CategoriaRepository;
import com.chiokore.backend.repository.ProductoRepository;
import com.chiokore.backend.repository.PromocionesRepository;
import com.chiokore.backend.services.ImageStorageService;
import com.chiokore.backend.servidor.BackendApplication;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.Filter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.nio.file.Files;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = BackendApplication.class)
@ActiveProfiles("test")
class SistemaIntegracionTest {

    @Autowired
    private WebApplicationContext contexto;

    @Autowired
    @Qualifier("springSecurityFilterChain")
    private Filter filtroSeguridad;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private PromocionesRepository promocionesRepository;

    @Autowired
    private ImageStorageService imageStorageService;

    private final ObjectMapper json = new ObjectMapper();

    private MockMvc mvc;
    private String tokenAdmin;
    private String tokenCajero;
    private Categoria categoria;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).addFilters(filtroSeguridad).build();
        tokenAdmin = "Bearer " + jwtService.generateToken("Admin Prueba", "ADMINISTRADOR", 1L);
        tokenCajero = "Bearer " + jwtService.generateToken("Cajero Prueba", "CAJERO", 2L);

        categoria = new Categoria();
        categoria.setNombre("Integracion " + System.nanoTime());
        categoria = categoriaRepository.save(categoria);
    }

    //metodo para crear un producto de prueba
    private Producto productoNuevo(String nombre, int stock) {
        Producto p = new Producto();
        p.setNombre(nombre);
        p.setPrecio(100.0);
        p.setStock(stock);
        p.setActivo(true);
        p.setEs_Unico(false);
        p.setCategoria(categoria);
        return productoRepository.save(p);
    }

    //metodo para armar el cuerpo de un cobro en efectivo
    private String cobroJson(int productoId, int cantidad, double recibido) throws Exception {
        CobroDTO cobro = new CobroDTO();
        cobro.setMetodoPago("EFECTIVO");
        cobro.setMontoRecibido(recibido);
        cobro.setModeloDispositivo("Tablet de prueba");
        cobro.setItems(List.of(new ItemDto(productoId, cantidad, 100.0)));
        return json.writeValueAsString(cobro);
    }

    //metodo para cobrar una venta y devolver el cuerpo de la respuesta
    private JsonNode cobrar(String body, String token, String ipRemota) throws Exception {
        MvcResult res = mvc.perform(post("/api/ventas/cobrar")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(request -> {
                            request.setRemoteAddr(ipRemota);
                            return request;
                        })
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return json.readTree(res.getResponse().getContentAsString());
    }

    //metodo para verificar que el catalogo publico responde sin token
    @Test
    void catalogoPublicoResponde() throws Exception {
        mvc.perform(get("/api/productos")).andExpect(status().isOk());
        mvc.perform(get("/api/productos/activos")).andExpect(status().isOk());
        mvc.perform(get("/api/categorias")).andExpect(status().isOk());
        mvc.perform(get("/api/promociones")).andExpect(status().isOk());
        mvc.perform(get("/api/productos/categoria/" + categoria.getId() + "/con-promo")).andExpect(status().isOk());
    }

    //metodo para verificar que el catalogo solo lo modifica un administrador
    @Test
    void soloElAdminModificaElCatalogo() throws Exception {
        Producto p = productoNuevo("Producto rol " + System.nanoTime(), 5);
        String cuerpo = "{\"activo\":false}";

        mvc.perform(patch("/api/productos/" + p.getId() + "/activo")
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo))
                .andExpect(status().isUnauthorized());

        mvc.perform(patch("/api/productos/" + p.getId() + "/activo")
                        .header("Authorization", tokenCajero)
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo))
                .andExpect(status().isForbidden());

        mvc.perform(patch("/api/productos/" + p.getId() + "/activo")
                        .header("Authorization", tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo))
                .andExpect(status().isOk());
    }

    //metodo para verificar el alta de producto desde el admin
    @Test
    void creaProductoDesdeElAdmin() throws Exception {
        ProductoAdminDTO datos = new ProductoAdminDTO(
                "Alta " + System.nanoTime(), 55.5, 7, categoria.getId(), true, false);
        MockMultipartFile parteDatos = new MockMultipartFile(
                "datos", "", MediaType.APPLICATION_JSON_VALUE, json.writeValueAsBytes(datos));

        mvc.perform(multipart("/api/productos").file(parteDatos).header("Authorization", tokenAdmin))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.stock").value(7));
    }

    //metodo para verificar que la venta guarda la ip normalizada
    @Test
    void laVentaGuardaLaIpNormalizada() throws Exception {
        Producto p = productoNuevo("Producto ip " + System.nanoTime(), 10);
        JsonNode cuerpo = cobrar(cobroJson(p.getId(), 1, 100.0), tokenCajero, "0:0:0:0:0:0:0:1");
        int ventaId = cuerpo.get("venta").get("id").asInt();

        MvcResult detalle = mvc.perform(get("/api/ventas/" + ventaId).header("Authorization", tokenAdmin))
                .andExpect(status().isOk())
                .andReturn();

        assertEquals("127.0.0.1",
                json.readTree(detalle.getResponse().getContentAsString()).get("ip_origen").asText());
    }

    //metodo para verificar que el cobro descuenta stock
    @Test
    void elCobroDescuentaStock() throws Exception {
        Producto p = productoNuevo("Producto stock " + System.nanoTime(), 10);
        cobrar(cobroJson(p.getId(), 3, 300.0), tokenCajero, "192.168.1.50");

        assertEquals(7, productoRepository.findById((long) p.getId()).orElseThrow().getStock());
    }

    //metodo para verificar que el cobro rechaza cantidades invalidas
    @Test
    void elCobroRechazaCantidadesInvalidas() throws Exception {
        Producto p = productoNuevo("Producto invalido " + System.nanoTime(), 10);

        mvc.perform(post("/api/ventas/cobrar")
                        .header("Authorization", tokenCajero)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cobroJson(p.getId(), -2, 0.0)))
                .andExpect(status().isBadRequest());

        mvc.perform(post("/api/ventas/cobrar")
                        .header("Authorization", tokenCajero)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cobroJson(p.getId(), 99, 9900.0)))
                .andExpect(status().isConflict());

        assertEquals(10, productoRepository.findById((long) p.getId()).orElseThrow().getStock());
    }

    //metodo para verificar que el cobro exige token
    @Test
    void elCobroExigeToken() throws Exception {
        Producto p = productoNuevo("Producto sin token " + System.nanoTime(), 5);

        mvc.perform(post("/api/ventas/cobrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cobroJson(p.getId(), 1, 100.0)))
                .andExpect(status().isUnauthorized());
    }

    //metodo para verificar que un producto sin ventas se elimina
    @Test
    void eliminaProductoSinVentas() throws Exception {
        Producto p = productoNuevo("Producto borrable " + System.nanoTime(), 4);

        mvc.perform(delete("/api/productos/" + p.getId()).header("Authorization", tokenAdmin))
                .andExpect(status().isOk());

        assertTrue(productoRepository.findById((long) p.getId()).isEmpty());
    }

    //metodo para verificar que un producto ya vendido no se elimina
    @Test
    void noEliminaProductoConVentas() throws Exception {
        Producto p = productoNuevo("Producto vendido " + System.nanoTime(), 10);
        cobrar(cobroJson(p.getId(), 1, 100.0), tokenCajero, "192.168.1.50");

        mvc.perform(delete("/api/productos/" + p.getId()).header("Authorization", tokenAdmin))
                .andExpect(status().isConflict());

        assertTrue(productoRepository.findById((long) p.getId()).isPresent());
    }

    //metodo para verificar que eliminar un producto inexistente devuelve 404
    @Test
    void eliminarProductoInexistenteDa404() throws Exception {
        mvc.perform(delete("/api/productos/987654").header("Authorization", tokenAdmin))
                .andExpect(status().isNotFound());
    }

    //metodo para verificar que cancelar una venta devuelve el stock
    @Test
    void cancelarVentaDevuelveElStock() throws Exception {
        Producto p = productoNuevo("Producto cancelado " + System.nanoTime(), 10);
        JsonNode cuerpo = cobrar(cobroJson(p.getId(), 2, 200.0), tokenCajero, "192.168.1.50");
        int ventaId = cuerpo.get("venta").get("id").asInt();

        assertEquals(8, productoRepository.findById((long) p.getId()).orElseThrow().getStock());

        mvc.perform(post("/api/ventas/" + ventaId + "/cancelar").header("Authorization", tokenAdmin))
                .andExpect(status().isOk());

        assertEquals(10, productoRepository.findById((long) p.getId()).orElseThrow().getStock());

        mvc.perform(post("/api/ventas/" + ventaId + "/cancelar").header("Authorization", tokenAdmin))
                .andExpect(status().isConflict());
    }

    //metodo para verificar que los reportes de ventas responden
    @Test
    void losReportesDeVentasResponden() throws Exception {
        Producto p = productoNuevo("Producto reporte " + System.nanoTime(), 10);
        cobrar(cobroJson(p.getId(), 1, 100.0), tokenCajero, "192.168.1.50");

        String hoy = LocalDate.now().toString();

        mvc.perform(get("/api/ventas").param("desde", hoy).param("hasta", hoy)
                .header("Authorization", tokenCajero)).andExpect(status().isOk());
        mvc.perform(get("/api/ventas/diario").param("desde", hoy).param("hasta", hoy)
                .header("Authorization", tokenAdmin)).andExpect(status().isOk());
        mvc.perform(get("/api/ventas/dia").param("fecha", hoy)
                .header("Authorization", tokenAdmin)).andExpect(status().isOk());
        mvc.perform(get("/api/ventas/resumen-dia").param("fecha", hoy)
                .header("Authorization", tokenAdmin)).andExpect(status().isOk());
        mvc.perform(get("/api/ventas/reporte-excel").param("desde", hoy).param("hasta", hoy)
                .header("Authorization", tokenAdmin)).andExpect(status().isOk());
    }

    //metodo para verificar que un rango de fechas invalido se rechaza
    @Test
    void elRangoDeFechasInvalidoSeRechaza() throws Exception {
        mvc.perform(get("/api/ventas/dia")
                        .param("desde", LocalDate.now().toString())
                        .header("Authorization", tokenAdmin))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/ventas/reporte-excel")
                        .param("desde", LocalDate.now().toString())
                        .param("hasta", LocalDate.now().minusDays(5).toString())
                        .header("Authorization", tokenAdmin))
                .andExpect(status().isBadRequest());
    }

    //metodo para verificar que un cajero no ve el historial de ventas
    @Test
    void elCajeroNoVeElHistorial() throws Exception {
        mvc.perform(get("/api/ventas/dia").param("fecha", LocalDate.now().toString())
                        .header("Authorization", tokenCajero))
                .andExpect(status().isForbidden());
    }

    //metodo para verificar el alta y baja de categorias
    @Test
    void administraCategorias() throws Exception {
        MockMultipartFile datos = new MockMultipartFile("datos", "", MediaType.APPLICATION_JSON_VALUE,
                "{\"nombre\":\"Categoria alta\"}".getBytes());

        MvcResult creada = mvc.perform(multipart("/api/categorias").file(datos)
                        .header("Authorization", tokenAdmin))
                .andExpect(status().isCreated())
                .andReturn();

        int id = json.readTree(creada.getResponse().getContentAsString()).get("id").asInt();

        mvc.perform(get("/api/categorias/" + id)).andExpect(status().isOk());
        mvc.perform(delete("/api/categorias/" + id).header("Authorization", tokenAdmin))
                .andExpect(status().isOk());
    }

    //metodo para crear una promocion de paquete en la categoria de la prueba
    private void promocionDePaquete(int cantidad, double precio) {
        Promocion promo = new Promocion();
        promo.setNombre("Paquete " + cantidad + " por " + precio);
        promo.setCategoria(categoria);
        promo.setActivo(true);
        promo.setFechaInicio(LocalDate.now().minusDays(1));
        promo.setFechaFin(LocalDate.now().plusDays(1));
        promo.setCantidadPaquete(cantidad);
        promo.setPrecioPaquete(precio);
        promo.setPrecioPromocional(0.0);
        promocionesRepository.save(promo);
    }

    //metodo para verificar que el catalogo expone la promocion de paquete
    @Test
    void elCatalogoExponeLaPromocionDePaquete() throws Exception {
        productoNuevo("Producto paquete " + System.nanoTime(), 20);
        promocionDePaquete(3, 240.0);

        mvc.perform(get("/api/productos/categoria/" + categoria.getId() + "/con-promo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tienePromo").value(true))
                .andExpect(jsonPath("$[0].cantidadPaquete").value(3))
                .andExpect(jsonPath("$[0].precioPaquete").value(240.0));
    }

    //metodo para verificar que el total cobrado coincide con la promocion de paquete
    @Test
    void elTotalCobradoAplicaLaPromocionDePaquete() throws Exception {
        Producto p = productoNuevo("Producto cobro paquete " + System.nanoTime(), 20);
        promocionDePaquete(3, 240.0);

        JsonNode cuerpo = cobrar(cobroJson(p.getId(), 3, 240.0), tokenCajero, "192.168.1.50");
        JsonNode venta = cuerpo.get("venta");

        assertEquals(240.0, venta.get("total").asDouble(), 0.001);
        assertEquals("COMPLETADA", venta.get("estado").asText());
        assertEquals(0.0, venta.get("cambio_entregado").asDouble(), 0.001);
    }

    //metodo para verificar que al editar una promocion se guardan fechas y categoria
    @Test
    void editarPromocionGuardaFechasYCategoria() throws Exception {
        promocionDePaquete(3, 240.0);
        long promoId = promocionesRepository.findAll().stream()
                .filter(pr -> pr.getCategoria().getId() == categoria.getId())
                .findFirst().orElseThrow().getId();

        Categoria otra = new Categoria();
        otra.setNombre("Destino " + System.nanoTime());
        otra = categoriaRepository.save(otra);

        String nuevoInicio = LocalDate.now().plusDays(5).toString();
        String nuevoFin = LocalDate.now().plusDays(20).toString();
        String cuerpo = "{\"nombre\":\"Editada\",\"descuento\":0,\"precioPromocional\":0,"
                + "\"cantidadPaquete\":4,\"precioPaquete\":300,\"activo\":true,"
                + "\"fechaInicio\":\"" + nuevoInicio + "\",\"fechaFin\":\"" + nuevoFin + "\","
                + "\"categoria\":{\"id\":" + otra.getId() + "}}";

        MockMultipartFile parte = new MockMultipartFile("promocion", "", MediaType.APPLICATION_JSON_VALUE,
                cuerpo.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        mvc.perform(multipart(org.springframework.http.HttpMethod.PUT, "/api/promociones/" + promoId)
                        .file(parte)
                        .header("Authorization", tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fechaInicio").value(nuevoInicio))
                .andExpect(jsonPath("$.fechaFin").value(nuevoFin))
                .andExpect(jsonPath("$.categoria.id").value(otra.getId()))
                .andExpect(jsonPath("$.cantidadPaquete").value(4));
    }

    //metodo para verificar que una promocion inexistente devuelve 404
    @Test
    void promocionInexistenteDa404() throws Exception {
        mvc.perform(get("/api/promociones/987654")).andExpect(status().isNotFound());

        mvc.perform(patch("/api/promociones/987654/activo")
                        .header("Authorization", tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"activo\":true}"))
                .andExpect(status().isNotFound());
    }

    //metodo para verificar que no se elimina una categoria con promociones
    @Test
    void noEliminaCategoriaConPromociones() throws Exception {
        promocionDePaquete(3, 240.0);

        mvc.perform(delete("/api/categorias/" + categoria.getId()).header("Authorization", tokenAdmin))
                .andExpect(status().isBadRequest());

        assertTrue(categoriaRepository.findById((long) categoria.getId()).isPresent());
    }

    //metodo para verificar que no se elimina una categoria con productos
    @Test
    void noEliminaCategoriaConProductos() throws Exception {
        productoNuevo("Producto de categoria " + System.nanoTime(), 3);

        mvc.perform(delete("/api/categorias/" + categoria.getId()).header("Authorization", tokenAdmin))
                .andExpect(status().isBadRequest());
    }

    //metodo para dar de alta un producto con imagen y devolver su ruta guardada
    private String altaConImagen() throws Exception {
        ProductoAdminDTO datos = new ProductoAdminDTO(
                "Con foto " + System.nanoTime(), 80.0, 4, categoria.getId(), true, false);
        MockMultipartFile parteDatos = new MockMultipartFile(
                "datos", "", MediaType.APPLICATION_JSON_VALUE, json.writeValueAsBytes(datos));
        MockMultipartFile parteImagen = new MockMultipartFile(
                "imagen", "foto.png", "image/png", new byte[]{1, 2, 3});

        MvcResult res = mvc.perform(multipart("/api/productos")
                        .file(parteDatos).file(parteImagen)
                        .header("Authorization", tokenAdmin))
                .andExpect(status().isCreated())
                .andReturn();

        return json.readTree(res.getResponse().getContentAsString()).get("url_imagen").asText();
    }

    //metodo para verificar que al borrar un producto se borra su imagen del disco
    @Test
    void borrarProductoBorraSuImagen() throws Exception {
        String ruta = altaConImagen();
        assertTrue(Files.exists(imageStorageService.getUploadRoot().resolve(ruta)));

        int id = productoRepository.findAll().stream()
                .filter(pr -> ruta.equals(pr.getUrl_imagen()))
                .findFirst().orElseThrow().getId();

        mvc.perform(delete("/api/productos/" + id).header("Authorization", tokenAdmin))
                .andExpect(status().isOk());

        assertFalse(Files.exists(imageStorageService.getUploadRoot().resolve(ruta)),
                "la imagen no debe quedar huerfana en uploads");
    }

    //metodo para verificar que al cambiar la imagen se borra la anterior
    @Test
    void cambiarLaImagenBorraLaAnterior() throws Exception {
        String rutaVieja = altaConImagen();
        Producto p = productoRepository.findAll().stream()
                .filter(pr -> rutaVieja.equals(pr.getUrl_imagen()))
                .findFirst().orElseThrow();

        ProductoAdminDTO datos = new ProductoAdminDTO(
                p.getNombre(), 90.0, 6, categoria.getId(), true, false);
        MockMultipartFile parteDatos = new MockMultipartFile(
                "datos", "", MediaType.APPLICATION_JSON_VALUE, json.writeValueAsBytes(datos));
        MockMultipartFile parteImagen = new MockMultipartFile(
                "imagen", "otra.png", "image/png", new byte[]{4, 5, 6});

        MvcResult res = mvc.perform(multipart(org.springframework.http.HttpMethod.PUT, "/api/productos/" + p.getId())
                        .file(parteDatos).file(parteImagen)
                        .header("Authorization", tokenAdmin))
                .andExpect(status().isOk())
                .andReturn();

        String rutaNueva = json.readTree(res.getResponse().getContentAsString()).get("url_imagen").asText();

        assertTrue(Files.exists(imageStorageService.getUploadRoot().resolve(rutaNueva)));
        assertFalse(Files.exists(imageStorageService.getUploadRoot().resolve(rutaVieja)),
                "la imagen reemplazada no debe quedar en uploads");
    }

    //metodo para verificar que un token con firma invalida se rechaza
    @Test
    void rechazaTokenInvalido() throws Exception {
        mvc.perform(get("/api/ventas/dia").param("fecha", LocalDate.now().toString())
                        .header("Authorization", "Bearer token.falso.aqui"))
                .andExpect(status().isUnauthorized());
    }
}
