package com.chiokore.backend.config;

import com.chiokore.backend.services.impl.SincronizacionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SyncScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SyncScheduler.class);

    private final SincronizacionService sincronizacionService;

    public SyncScheduler(SincronizacionService sincronizacionService) {
        this.sincronizacionService = sincronizacionService;
    }

    /**
     * Sincroniza los usuarios del sistema de asistencia.
     *
     * El intervalo por defecto es de 2 minutos (lo que siempre dijo el comentario;
     * el codigo corria cada 10 segundos, es decir 6 llamadas por minuto a la API
     * externa reescribiendo toda la tabla de usuarios en cada pasada).
     */
    @Scheduled(fixedRateString = "${asistencia.sync.intervalo-ms:120000}")
    public void ejecutarSincronizacion() {
        logger.debug("Sincronizando usuarios del sistema de asistencia");
        sincronizacionService.sincronizarDatos();
    }
}
