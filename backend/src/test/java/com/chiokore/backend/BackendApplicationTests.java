package com.chiokore.backend;

import com.chiokore.backend.servidor.BackendApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Verifica que todo el contexto de Spring arranca: beans, seguridad, JPA y la
 * validacion de la llave JWT. Usa H2 en memoria (perfil "test").
 *
 * Hay que nombrar BackendApplication a mano porque la clase vive en el subpaquete
 * "servidor" y no en la raiz "com.chiokore.backend"; Spring Boot busca la clase de
 * arranque hacia arriba desde el paquete de la prueba y por eso no la encontraba.
 */
@SpringBootTest(classes = BackendApplication.class)
@ActiveProfiles("test")
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
