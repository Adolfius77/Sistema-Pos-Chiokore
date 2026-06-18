package com.chiokore.backend.servidor;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.chiokore.backend")

@EnableJpaRepositories(basePackages = "com.chiokore.backend.repository")

@EntityScan(basePackages = "com.chiokore.backend.modelo")
public class BackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}