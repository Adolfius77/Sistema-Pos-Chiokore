package com.chiokore.backend.config;

import com.chiokore.backend.services.TicketStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final TicketStorageService ticketStorageService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadLocation = ticketStorageService.getUploadRoot().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation.endsWith("/") ? uploadLocation : uploadLocation + "/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5175")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}