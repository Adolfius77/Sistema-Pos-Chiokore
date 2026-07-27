package com.chiokore.backend.api;

import com.chiokore.backend.dtos.PosStatusDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Collections;

/**
 * Cliente dedicado exclusivamente a la comunicación con la API de Asistencia.
 */
@Component
public class AsistenciaApiClient {

    private final RestTemplate restTemplate;

    @Value("${asistencia.api.url}")
    private String apiUrl;

    @Value("${asistencia.api.token}")
    private String apiToken;

    public AsistenciaApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<PosStatusDTO> obtenerEmpleadosPos() {
        try {
            String url = apiUrl + "/api/empleados/pos-status";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<PosStatusDTO[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    PosStatusDTO[].class
            );

            if (response.getBody() != null) {
                return Arrays.asList(response.getBody());
            }
        } catch (Exception e) {
            System.err.println("Error al comunicarse con Asistencia: " + e.getMessage());
        }
        return Collections.emptyList();
    }
}