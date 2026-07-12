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
public class TicketStorageService {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Path uploadRoot;

    public TicketStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String guardarTicket(MultipartFile ticket) {
        if (ticket == null || ticket.isEmpty()) {
            throw new IllegalArgumentException("Debe adjuntar la foto del ticket.");
        }

        String contentType = ticket.getContentType();
        if (contentType == null || !TIPOS_PERMITIDOS.contains(contentType)) {
            throw new IllegalArgumentException("El ticket debe ser una imagen JPG, PNG o WEBP.");
        }

        try {
            Path ticketsDir = uploadRoot.resolve("tickets");
            Files.createDirectories(ticketsDir);

            String extension = extensionDesdeContentType(contentType);
            String filename = LocalDate.now() + "_" + UUID.randomUUID() + extension;
            Path destino = ticketsDir.resolve(filename);
            ticket.transferTo(destino);

            return "tickets/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("No se pudo guardar la foto del ticket.", e);
        }
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
