package com.chiokore.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /** Misma llave que firma JwtService. NO es el token de la API de asistencia. */
    @Value("${app.jwt.secret}")
    private String secretKey;

    /**
     * Origenes permitidos para CORS. Se admiten comodines porque el POS se abre
     * desde tablets y telefonos con IP variable dentro de la red local.
     */
    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Se usan tokens Bearer, no cookies de sesion: CSRF no aplica.
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Preflight primero: si no, lo atrapa cualquier regla de abajo.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Endpoints de autenticacion y archivos publicos
                        .requestMatchers("/api/pos/auth/**", "/uploads/**").permitAll()

                        // Lectura publica del catalogo
                        .requestMatchers(HttpMethod.GET, "/api/productos/**", "/api/promociones/**", "/api/categorias/**").permitAll()

                        // Alta/baja/cambio de catalogo: solo administradores
                        .requestMatchers(HttpMethod.POST, "/api/productos/**", "/api/categorias/**", "/api/promociones/**").hasAuthority("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/productos/**", "/api/categorias/**", "/api/promociones/**").hasAuthority("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/productos/**", "/api/categorias/**", "/api/promociones/**").hasAuthority("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/productos/**", "/api/categorias/**", "/api/promociones/**").hasAuthority("ADMINISTRADOR")

                        // Cobrar es lo unico que necesita el cajero en /api/ventas.
                        .requestMatchers(HttpMethod.POST, "/api/ventas/cobrar").authenticated()
                        // Resumen por rango: lo consume el modulo externo de Nomina.
                        .requestMatchers(HttpMethod.GET, "/api/ventas").authenticated()
                        // Historial, cancelaciones, reportes y utilidades de recalculo
                        // reescriben o exponen datos historicos: solo administradores.
                        .requestMatchers("/api/ventas/**").hasAuthority("ADMINISTRADOR")

                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .headers(headers -> headers
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
                        .frameOptions(frame -> frame.sameOrigin())
                );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKey key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    /**
     * Convierte claims de distintos formatos a GrantedAuthority.
     * Busca en: 'roles', 'role', 'rol', 'realm_access.roles' y 'authorities'.
     */
    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> roles = new ArrayList<>();

            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null && realmAccess.get("roles") instanceof Collection<?> anidados) {
                anidados.forEach(o -> roles.add(String.valueOf(o)));
            }
            if (jwt.getClaim("roles") instanceof Collection<?> lista) {
                lista.forEach(o -> roles.add(String.valueOf(o)));
            }
            if (jwt.getClaim("authorities") instanceof Collection<?> lista) {
                lista.forEach(o -> roles.add(String.valueOf(o)));
            }
            if (jwt.getClaim("role") != null) roles.add(String.valueOf(jwt.getClaim("role")));
            if (jwt.getClaim("rol") != null) roles.add(String.valueOf(jwt.getClaim("rol")));

            Set<GrantedAuthority> authorities = new HashSet<>();
            for (String r : roles) {
                if (r == null || r.isBlank()) continue;
                String normalized = r.trim();
                if (normalized.startsWith("ROLE_")) normalized = normalized.substring(5);
                String upper = normalized.toUpperCase();
                // Sinonimos de admin -> ADMINISTRADOR
                if (upper.equals("ADMIN") || upper.equals("ADMINISTRATOR") || upper.equals("ADMINISTRADOR")) {
                    authorities.add(new SimpleGrantedAuthority("ADMINISTRADOR"));
                } else {
                    authorities.add(new SimpleGrantedAuthority(normalized));
                }
            }
            return authorities;
        });
        return converter;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // setAllowedOriginPatterns (no setAllowedOrigins) para poder usar comodines
        // junto con allowCredentials. Un "*" literal con credenciales lo rechaza el navegador.
        configuration.setAllowedOriginPatterns(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Las imagenes de /uploads/** se sirven sin pasar por el filtro de seguridad,
     * para que una peticion de imagen no devuelva 401.
     */
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers("/uploads/**");
    }
}
