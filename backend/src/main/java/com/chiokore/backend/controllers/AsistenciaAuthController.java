package com.chiokore.backend.controllers;

import com.chiokore.backend.config.JwtService;
import com.chiokore.backend.modelo.usuario_asistencia;
import com.chiokore.backend.repository.UsuarioAsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pos/auth")
public class AsistenciaAuthController {

    @Autowired
    private UsuarioAsistenciaRepository usuarioAsistenciaRepository;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login/{idAsistencia}")
    public ResponseEntity<?>login(@PathVariable Long idAsistencia) {
        Optional<usuario_asistencia> usuarioAsistencia = usuarioAsistenciaRepository.findById(idAsistencia);

        if(usuarioAsistencia.isPresent()){
            return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado en el sistema de asistencia."));
        }
        if(!usuarioAsistencia.get().isActivo() || !usuarioAsistencia.get().isMarcoAsistencia()){
            return ResponseEntity.status(403).body(Map.of("error", "acceso negado. ve a tomar asistencia en el checador de asistencia."));
        }
        usuario_asistencia usuario = usuarioAsistencia.get();
        String tokenGenerado = jwtService.generateToken(usuario.getNombre(), usuario.getRol());

        Map<String,Object> response = new HashMap<>();
        response.put("mensaje","login exitoso");
        response.put("usuario",usuario.getNombre());
        response.put("rol",usuario.getRol());
        response.put("token",tokenGenerado);
        return ResponseEntity.ok(response);
    }
}
