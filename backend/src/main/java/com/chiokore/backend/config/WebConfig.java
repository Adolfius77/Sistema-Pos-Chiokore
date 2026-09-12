package com.chiokore.backend.config;

import com.chiokore.backend.services.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Solo expone la carpeta de imagenes subidas.
 *
 * El CORS vive unicamente en SecurityConfig#corsConfigurationSource. Antes tambien
 * se declaraba aqui con allowedOriginPatterns("*") + allowCredentials(true), lo que
 * abria la API a cualquier origen y ademas contradecia la lista de SecurityConfig.
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final ImageStorageService imageStorageService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadLocation = imageStorageService.getUploadRoot().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation.endsWith("/") ? uploadLocation : uploadLocation + "/");
    }
}
