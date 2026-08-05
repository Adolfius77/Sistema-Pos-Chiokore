package com.chiokore.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${asistencia.api.token}")
    private String secretKey;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Si usas tokens (Authorization Bearer) está bien deshabilitar CSRF; si usas cookies, habilitar CSRF con token.
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Endpoints de autenticación/recursos públicos
                        .requestMatchers("/api/pos/auth/**", "/uploads/**").permitAll()
                        // Lectura pública: catálogo, promociones (si quieres que el catálogo sea público)
                        .requestMatchers(HttpMethod.GET, "/api/productos/**", "/api/promociones/**", "/api/categorias/**").permitAll()
                        // Operaciones administrativas: requieren rol ADMINISTRADOR
                        .requestMatchers(HttpMethod.POST, "/api/productos/**", "/api/categorias/**", "/api/promociones/**").hasAuthority("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT,  "/api/productos/**", "/api/categorias/**", "/api/promociones/**").hasAuthority("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.DELETE,"/api/productos/**", "/api/categorias/**", "/api/promociones/**").hasAuthority("ADMINISTRADOR")
                        // Allow preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Operaciones de venta: requieren estar autenticado (empleado)
                        .requestMatchers("/api/ventas/**").authenticated()
                        // Cualquier otra ruta: autenticada
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
        SecretKey key = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    /**
     * Convierte claims de diferentes formatos a GrantedAuthority.
     * Busca en: 'roles', 'role', 'rol', 'realm_access.roles' y 'authorities'.
     */
    private org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter jwtAuthenticationConverter() {
        org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter converter = new org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            java.util.List<String> roles = new java.util.ArrayList<>();
            Object r1 = jwt.getClaimAsMap("realm_access");
            if (r1 instanceof java.util.Map) {
                Object rr = ((java.util.Map) r1).get("roles");
                if (rr instanceof java.util.Collection) {
                    for (Object o : (java.util.Collection) rr) roles.add(String.valueOf(o));
                }
            }
            Object claimRoles = jwt.getClaim("roles");
            if (claimRoles instanceof java.util.Collection) for (Object o : (java.util.Collection) claimRoles) roles.add(String.valueOf(o));
            Object claimRole = jwt.getClaim("role"); if (claimRole != null) roles.add(String.valueOf(claimRole));
            Object claimRol = jwt.getClaim("rol"); if (claimRol != null) roles.add(String.valueOf(claimRol));
            Object claimAuthorities = jwt.getClaim("authorities"); if (claimAuthorities instanceof java.util.Collection) for (Object o : (java.util.Collection) claimAuthorities) roles.add(String.valueOf(o));

            java.util.Set<org.springframework.security.core.GrantedAuthority> authorities = new java.util.HashSet<>();
            for (String r : roles) {
                if (r == null) continue;
                String normalized = r.trim();
                // Algunos tokens vienen con prefijos como ROLE_ o mayúsculas distintas
                if (normalized.startsWith("ROLE_")) normalized = normalized.substring(5);
                String upper = normalized.toUpperCase();
                // Mapear sinónimos de admin a ADMINISTRADOR
                if (upper.equals("ADMIN") || upper.equals("ADMINISTRATOR") || upper.equals("ADMINISTRADOR")) {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADMINISTRADOR"));
                } else {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(normalized));
                }
            }
            return authorities;
        });
        return converter;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5175",
                "http://localhost:5173",
                "http://192.168.1.78:5175",
                "http://192.168.1.78:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Ignorar las peticiones a recursos estáticos /uploads/** para que no pasen por el filtro de seguridad.
     * Esto evita que una petición de imagen devuelva 401 cuando debería ser pública.
     */
    @Bean
    public org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers("/uploads/**");
    }
}