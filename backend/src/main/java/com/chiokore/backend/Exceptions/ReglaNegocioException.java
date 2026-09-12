package com.chiokore.backend.Exceptions;

/**
 * La peticion es sintacticamente valida pero viola una regla del negocio
 * (stock insuficiente, venta ya cancelada, etc.). Se traduce a HTTP 409.
 */
public class ReglaNegocioException extends RuntimeException {
    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
