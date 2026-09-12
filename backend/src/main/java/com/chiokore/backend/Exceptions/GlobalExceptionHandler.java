package com.chiokore.backend.Exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * El cuerpo mantiene las claves "error" y "mensaje" porque el frontend
     * (services/ventas.js) las lee en ese orden para mostrar el aviso al cajero.
     */
    private ResponseEntity<Map<String, String>> respuesta(HttpStatus status, String mensaje) {
        return ResponseEntity.status(status).body(Map.of(
                "error", mensaje,
                "mensaje", mensaje
        ));
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, String>> noEncontrado(RecursoNoEncontradoException ex) {
        return respuesta(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<Map<String, String>> reglaNegocio(ReglaNegocioException ex) {
        return respuesta(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> peticionInvalida(IllegalArgumentException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /**
     * Red de seguridad: cualquier fallo no previsto se registra completo en el log
     * del servidor pero al cliente solo se le devuelve un mensaje generico, para no
     * filtrar detalles internos (nombres de tabla, stack traces, etc.).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> errorInterno(Exception ex) {
        logger.error("Error no controlado", ex);
        return respuesta(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrio un error interno. Intenta de nuevo o avisa al administrador.");
    }
}
