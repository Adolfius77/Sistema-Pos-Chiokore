package com.chiokore.backend.Exceptions;

/**
 * El recurso solicitado no existe. Se traduce a HTTP 404.
 */
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
