package com.chiokore.backend.controllers;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Utilidad de depuracion local.
 *
 * Solo existe bajo el perfil "dev" (arranca con -Dspring.profiles.active=dev):
 * antes se publicaba siempre y devolvia ademas el token crudo.
 */
@RestController
@RequestMapping("/api/debug")
@Profile("dev")
public class DebugController {

    @GetMapping("/claims")
    public ResponseEntity<?> claims(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No JWT presente"));
        }
        return ResponseEntity.ok(Map.of(
                "claims", jwt.getClaims(),
                "subject", jwt.getSubject()
        ));
    }
}
