package com.chiokore.backend.utils;

import java.util.regex.Pattern;

/**
 * Normaliza la direccion que reporta el servidor a un formato legible para el
 * campo ip_origen de la venta.
 *
 * La JVM prefiere la pila IPv6, asi que una venta cobrada desde la misma
 * maquina del backend llega como "0:0:0:0:0:0:0:1" (el loopback IPv6) en lugar
 * de "127.0.0.1", y un cliente IPv4 por un socket IPv6 puede llegar como
 * "::ffff:192.168.1.50". Aqui se dejan ambos casos en notacion IPv4.
 */
public final class ClientIpUtil {

    private static final String LOOPBACK_IPV4 = "127.0.0.1";

    private static final Pattern ES_IPV4 = Pattern.compile(
            "(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])([.](25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}");

    private ClientIpUtil() {
    }

    /**
     * Devuelve la direccion normalizada, o null si venia vacia o ilegible.
     */
    public static String normalizar(String ip) {
        if (ip == null || ip.isBlank()) {
            return null;
        }

        String limpia = quitarZona(quitarPuerto(ip.trim()));
        if (limpia.isEmpty()) {
            return null;
        }

        // IPv4 embebida en notacion IPv6: "::ffff:192.168.1.50",
        // "0:0:0:0:0:ffff:192.168.1.50" o "::192.168.1.50".
        int ultimoDosPuntos = limpia.lastIndexOf(':');
        if (ultimoDosPuntos >= 0 && limpia.indexOf('.') > ultimoDosPuntos) {
            String cola = limpia.substring(ultimoDosPuntos + 1);
            if (ES_IPV4.matcher(cola).matches()) {
                return cola;
            }
        }

        if (esLoopbackIpv6(limpia)) {
            return LOOPBACK_IPV4;
        }

        return limpia;
    }

    /**
     * Algunos proxies anexan el puerto de origen: "192.168.1.50:54321" o
     * "[0:0:0:0:0:0:0:1]:54321".
     */
    private static String quitarPuerto(String ip) {
        if (ip.startsWith("[")) {
            int cierre = ip.indexOf(']');
            if (cierre > 0) {
                return ip.substring(1, cierre);
            }
            return ip;
        }

        int dosPuntos = ip.indexOf(':');
        // Un solo ':' descarta IPv6, asi que lo que sigue solo puede ser el puerto.
        if (dosPuntos > 0 && ip.indexOf(':', dosPuntos + 1) < 0) {
            return ip.substring(0, dosPuntos);
        }

        return ip;
    }

    /**
     * Quita el identificador de zona de las IPv6 de enlace local ("fe80::1%eth0"):
     * es un detalle de la interfaz de red del servidor, no de quien cobro.
     */
    private static String quitarZona(String ip) {
        int zona = ip.indexOf('%');
        return zona >= 0 ? ip.substring(0, zona) : ip;
    }

    /**
     * Reconoce el loopback IPv6 en cualquiera de sus escrituras: "::1",
     * "0:0:0:0:0:0:0:1" o "0000:0000:0000:0000:0000:0000:0000:0001".
     */
    private static boolean esLoopbackIpv6(String ip) {
        if (ip.indexOf(':') < 0) {
            return false;
        }

        String[] grupos = ip.split(":", -1);
        boolean terminaEnUno = false;

        for (int i = 0; i < grupos.length; i++) {
            String grupo = grupos[i];
            if (grupo.isEmpty()) {
                // Parte comprimida ("::"): son grupos en cero.
                continue;
            }

            int valor;
            try {
                valor = Integer.parseInt(grupo, 16);
            } catch (NumberFormatException e) {
                return false;
            }

            if (i == grupos.length - 1 && valor == 1) {
                terminaEnUno = true;
                continue;
            }
            if (valor != 0) {
                return false;
            }
        }

        return terminaEnUno;
    }
}
