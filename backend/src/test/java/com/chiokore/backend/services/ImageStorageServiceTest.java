package com.chiokore.backend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ImageStorageServiceTest {

    @TempDir
    Path raiz;

    private ImageStorageService servicio;

    @BeforeEach
    void preparar() {
        servicio = new ImageStorageService(raiz.toString());
    }

    //metodo para guardar una imagen de prueba y devolver su ruta relativa
    private String guardarImagen(String subcarpeta) {
        MockMultipartFile archivo = new MockMultipartFile(
                "imagen", "foto.png", "image/png", new byte[]{1, 2, 3});
        return servicio.guardar(subcarpeta, archivo);
    }

    //metodo para verificar que la imagen guardada se borra del disco
    @Test
    void borraLaImagenGuardada() {
        String ruta = guardarImagen("productos");
        assertTrue(Files.exists(raiz.resolve(ruta)));

        servicio.eliminar(ruta);

        assertFalse(Files.exists(raiz.resolve(ruta)));
    }

    //metodo para verificar que no falla con rutas vacias o nulas
    @Test
    void ignoraRutasVacias() {
        servicio.eliminar(null);
        servicio.eliminar("");
        servicio.eliminar("   ");
    }

    //metodo para verificar que no toca los assets del frontend ni las urls externas
    @Test
    void ignoraAssetsDelFrontendYUrls() throws IOException {
        Path externo = raiz.getParent().resolve("camisa-" + System.nanoTime() + ".png");
        Files.write(externo, new byte[]{9});

        servicio.eliminar("/" + externo.getFileName());
        servicio.eliminar("https://ejemplo.com/foto.png");
        servicio.eliminar("http://ejemplo.com/foto.png");

        assertTrue(Files.exists(externo), "un asset fuera de uploads no se debe borrar");
        Files.deleteIfExists(externo);
    }

    //metodo para verificar que una ruta que se sale de uploads no borra nada
    @Test
    void ignoraRutasQueSalenDeUploads() throws IOException {
        Path afuera = raiz.getParent().resolve("secreto-" + System.nanoTime() + ".txt");
        Files.write(afuera, new byte[]{7});

        servicio.eliminar("../" + afuera.getFileName());

        assertTrue(Files.exists(afuera), "no debe borrar fuera de la carpeta de uploads");
        Files.deleteIfExists(afuera);
    }

    //metodo para verificar que los comprobantes de venta no se borran
    @Test
    void noBorraLosTicketsDeVenta() {
        String ruta = guardarImagen("tickets");

        servicio.eliminar(ruta);

        assertTrue(Files.exists(raiz.resolve(ruta)), "los tickets son comprobante de la venta");
    }

    //metodo para verificar que no se borra una carpeta completa
    @Test
    void noBorraCarpetas() {
        guardarImagen("productos");

        servicio.eliminar("productos");

        assertTrue(Files.isDirectory(raiz.resolve("productos")));
    }

    //metodo para verificar que solo se aceptan imagenes
    @Test
    void rechazaArchivosQueNoSonImagen() {
        MockMultipartFile pdf = new MockMultipartFile(
                "imagen", "doc.pdf", "application/pdf", new byte[]{1});

        assertThrows(IllegalArgumentException.class, () -> servicio.guardar("productos", pdf));
    }
}
