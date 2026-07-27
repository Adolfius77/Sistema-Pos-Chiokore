package com.chiokore.backend.services.impl;

import com.chiokore.backend.dtos.PosStatusDTO;
import com.chiokore.backend.modelo.usuario_asistencia;
import com.chiokore.backend.repository.UsuarioAsistenciaRepository;
import com.chiokore.backend.services.ISincronizacion;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.chiokore.backend.api.AsistenciaApiClient;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SincronizacionService implements ISincronizacion {

    private final AsistenciaApiClient asistenciaApiClient;
    private final UsuarioAsistenciaRepository usuarioAsistenciaRepository;

    public SincronizacionService(AsistenciaApiClient asistenciaApiClient,UsuarioAsistenciaRepository usuarioAsistenciaRepository) {
        this.asistenciaApiClient = asistenciaApiClient;
        this.usuarioAsistenciaRepository = usuarioAsistenciaRepository;
    }

    @Override
    @Transactional
    public void sincronizarDatos() {
        List<PosStatusDTO> empleadosRemotos = asistenciaApiClient.obtenerEmpleadosPos();

        if(empleadosRemotos.isEmpty()){
            return;
        }
        List<Long> idsRemotos = empleadosRemotos.stream().
                map(PosStatusDTO::getId).
                collect(Collectors.toList());
        for(PosStatusDTO posStatusDTO : empleadosRemotos){
            usuario_asistencia usuario = usuarioAsistenciaRepository.findById(posStatusDTO.getId()).orElse(new usuario_asistencia());
            usuario.setIdAsistencia(posStatusDTO.getId());
            usuario.setNombre(posStatusDTO.getNombre());
            usuario.setRol(posStatusDTO.getRol());
            usuario.setActivo(posStatusDTO.isActivo());
            usuario.setMarcoAsistencia(posStatusDTO.isMarcoAsistencia());

            boolean puedeAcceder = posStatusDTO.isActivo() && posStatusDTO.isMarcoAsistencia();
            usuario.setActivo(puedeAcceder);
            usuarioAsistenciaRepository.save(usuario);

            //esto desactiva a los usuario que ya no existen en el sistema de asistencia
            List<usuario_asistencia>usuariosLocales = usuarioAsistenciaRepository.findAll();
            for (usuario_asistencia local : usuariosLocales) {
                if(!idsRemotos.contains(local.getIdAsistencia())){
                    local.setActivo(false);
                    local.setMarcoAsistencia(false);
                    usuarioAsistenciaRepository.save(local);

                }
            }

        }
    }
}
