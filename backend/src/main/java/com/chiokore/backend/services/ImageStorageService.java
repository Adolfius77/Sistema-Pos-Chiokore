package com.chiokore.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Path uploadRoot;

    public ImageStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String guardar(String subcarpeta, MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("Debe adjuntar una imagen.");
        }

        String contentType = archivo.getContentType();
        if (contentType == null || !TIPOS_PERMITIDOS.contains(contentType)) {
            throw new IllegalArgumentException("La imagen debe ser JPG, PNG o WEBP.");
        }

        try {
            Path dir = uploadRoot.resolve(subcarpeta);
            Files.createDirectories(dir);

            String extension = extensionDesdeContentType(contentType);
            String filename = LocalDate.now() + "_" + UUID.randomUUID() + extension;
            Path destino = dir.resolve(filename);
            archivo.transferTo(destino);

            return subcarpeta + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("No se pudo guardar la imagen.", e);
        }
    }

    public String guardarTicket(MultipartFile ticket) {
        return guardar("tickets", ticket);
    }

    public Path getUploadRoot() {
        return uploadRoot;
    }

    private String extensionDesdeContentType(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
