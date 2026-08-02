package com.chiokore.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    // Dev-only: devuelve los claims del JWT autenticado para depuración local
    @GetMapping("/claims")
    public ResponseEntity<?> claims(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No JWT presente"));
        }
        return ResponseEntity.ok(Map.of(
                "claims", jwt.getClaims(),
                "subject", jwt.getSubject(),
                "tokenValue", jwt.getTokenValue()
        ));
    }
}
