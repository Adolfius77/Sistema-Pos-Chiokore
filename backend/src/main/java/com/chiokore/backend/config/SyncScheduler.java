package com.chiokore.backend.config;

import com.chiokore.backend.services.impl.SincronizacionService;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SyncScheduler {
    private final SincronizacionService sincronizacionService;

    public SyncScheduler(SincronizacionService sincronizacionService) {
        this.sincronizacionService = sincronizacionService;
    }
    //este metodo se ejecuta cada 2 minutos para sincronizar los usuarios del sistema de asistencia
    @Scheduled(fixedRate = 10000)
    public void ejecutarSincronizacion() {
        System.out.println("Ejecutando sincronización de usuarios del sistema de asistencia....");
        sincronizacionService.sincronizarDatos();
    }
}
