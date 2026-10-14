package com.chiokore.backend.utils;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ClientIpUtilTest {

    @Test
    void traduceElLoopbackIpv6ADireccionIpv4() {
        assertEquals("127.0.0.1", ClientIpUtil.normalizar("0:0:0:0:0:0:0:1"));
        assertEquals("127.0.0.1", ClientIpUtil.normalizar("::1"));
        assertEquals("127.0.0.1", ClientIpUtil.normalizar("0000:0000:0000:0000:0000:0000:0000:0001"));
        assertEquals("127.0.0.1", ClientIpUtil.normalizar("[0:0:0:0:0:0:0:1]:54321"));
    }

    @Test
    void desenvuelveLasIpv4EmbebidasEnIpv6() {
        assertEquals("192.168.1.50", ClientIpUtil.normalizar("::ffff:192.168.1.50"));
        assertEquals("192.168.1.50", ClientIpUtil.normalizar("0:0:0:0:0:ffff:192.168.1.50"));
        assertEquals("192.168.1.50", ClientIpUtil.normalizar("::192.168.1.50"));
    }

    @Test
    void dejaIntactasLasDireccionesNormales() {
        assertEquals("192.168.1.75", ClientIpUtil.normalizar("192.168.1.75"));
        assertEquals("127.0.0.1", ClientIpUtil.normalizar("127.0.0.1"));
        assertEquals("2001:db8::a1", ClientIpUtil.normalizar("2001:db8::a1"));
    }

    @Test
    void limpiaPuertoZonaYEspacios() {
        assertEquals("192.168.1.50", ClientIpUtil.normalizar(" 192.168.1.50:54321 "));
        assertEquals("fe80::1a2b", ClientIpUtil.normalizar("fe80::1a2b%eth0"));
    }

    @Test
    void devuelveNullCuandoNoHayDato() {
        assertNull(ClientIpUtil.normalizar(null));
        assertNull(ClientIpUtil.normalizar("   "));
    }

    @Test
    void noConfundeOtrasIpv6ConElLoopback() {
        assertEquals("0:0:0:0:0:0:0:2", ClientIpUtil.normalizar("0:0:0:0:0:0:0:2"));
        assertEquals("2001::1", ClientIpUtil.normalizar("2001::1"));
    }
}
