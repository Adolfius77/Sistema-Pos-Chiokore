package com.chiokore.backend.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    /**
     * Llave propia del POS para firmar sus tokens. Es deliberadamente distinta del
     * token con el que hablamos con el microservicio de asistencia: si fueran la
     * misma, quien conociera ese token podria fabricar tokens de ADMINISTRADOR.
     */
    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiracion-ms:28800000}")
    private long jwtExpirationInMs;

    /** HS256 exige una llave de al menos 256 bits; fallar al arrancar es mejor que fallar al firmar. */
    @PostConstruct
    void validarLlave() {
        if (secretKey == null || secretKey.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret debe tener al menos 32 caracteres. Definelo con la variable de entorno APP_JWT_SECRET.");
        }
    }

    public String generateToken(String nombre, String rol, Long empleadoId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("rol", rol);
        claims.put("empleadoId", empleadoId);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(nombre)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(String nombre, String rol) {
        return generateToken(nombre, rol, null);
    }

    private Key getKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }
}
