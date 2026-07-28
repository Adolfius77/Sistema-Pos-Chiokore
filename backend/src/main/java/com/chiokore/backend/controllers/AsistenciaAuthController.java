package com.chiokore.backend.controllers;

import com.chiokore.backend.config.JwtService;
import com.chiokore.backend.modelo.usuario_asistencia;
import com.chiokore.backend.repository.UsuarioAsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pos/auth")
public class AsistenciaAuthController {

    @Autowired
    private UsuarioAsistenciaRepository usuarioAsistenciaRepository;

    @Autowired
    private JwtService jwtService;

    @Value("${admin.clave}")
    private String adminClave;

    @GetMapping("/usuarios")
    public ResponseEntity<?> listarUsuarios() {
        List<usuario_asistencia> todos = usuarioAsistenciaRepository.findByActivoTrue();

        List<Map<String, Object>> resultado = todos.stream()
                .map(u -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("idAsistencia", u.getIdAsistencia());
                    item.put("nombre", u.getNombre());
                    item.put("rol", u.getRol());
                    item.put("marcoAsistencia", u.isMarcoAsistencia());
                    item.put("initial", obtenerInitial(u.getNombre()));
                    return item;
                })
                .toList();

        return ResponseEntity.ok(resultado);
    }

    @PostMapping("/login/{idAsistencia}")
    public ResponseEntity<?> login(
            @PathVariable Long idAsistencia,
            @RequestBody(required = false) Map<String, String> body
    ) {
        var opt = usuarioAsistenciaRepository.findById(idAsistencia);

        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "error", "Usuario no encontrado en el sistema de asistencia."
            ));
        }

        usuario_asistencia usuario = opt.get();

        if (!usuario.isActivo()) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Usuario inactivo. Contacta al administrador."
            ));
        }

        boolean esAdmin = "ADMINISTRADOR".equalsIgnoreCase(usuario.getRol());

        if (esAdmin) {
            String claveIngresada = body != null ? body.getOrDefault("clave", "") : "";
            if (!adminClave.equals(claveIngresada)) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Clave de administrador incorrecta."
                ));
            }
        } else if (!usuario.isMarcoAsistencia()) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "No has marcado asistencia hoy. Ve al checador primero."
            ));
        }

        String token = jwtService.generateToken(
                usuario.getNombre(),
                usuario.getRol(),
                usuario.getIdAsistencia()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "login exitoso");
        response.put("usuario", usuario.getNombre());
        response.put("rol", usuario.getRol());
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    private String obtenerInitial(String nombre) {
        if (nombre == null || nombre.isBlank()) return "?";
        String[] partes = nombre.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : partes) {
            sb.append(Character.toUpperCase(p.charAt(0)));
        }
        return sb.toString();
    }
}
