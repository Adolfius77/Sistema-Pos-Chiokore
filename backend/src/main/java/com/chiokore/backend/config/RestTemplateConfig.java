package com.chiokore.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    /**
     * Crea y expone un RestTemplate para que pueda ser inyectado
     * en clases como AsistenciaApiClient.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
