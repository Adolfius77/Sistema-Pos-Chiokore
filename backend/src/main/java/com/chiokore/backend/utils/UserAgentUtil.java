package com.chiokore.backend.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Traduce un header User-Agent crudo a una etiqueta de dispositivo legible.
 * Se usa solo como respaldo cuando el cliente (frontend) no pudo enviar el
 * modelo exacto detectado en el navegador (por ejemplo, si viene de una
 * integracion externa o de un cliente sin JavaScript).
 */
public final class UserAgentUtil {

    private static final Pattern SAMSUNG = Pattern.compile("SM-[A-Z0-9]{3,6}", Pattern.CASE_INSENSITIVE);
    private static final Pattern ANDROID_MODELO = Pattern.compile("Android\\s[\\d.]+;\\s([^;)]+)\\)", Pattern.CASE_INSENSITIVE);
    private static final Pattern IPHONE_VERSION = Pattern.compile("iPhone OS ([\\d_]+)", Pattern.CASE_INSENSITIVE);

    private UserAgentUtil() {
    }

    public static String aEtiquetaLegible(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Dispositivo desconocido";
        }

        Matcher samsung = SAMSUNG.matcher(userAgent);
        if (samsung.find()) {
            return "Samsung " + samsung.group().toUpperCase();
        }

        Matcher androidModelo = ANDROID_MODELO.matcher(userAgent);
        if (androidModelo.find()) {
            String modelo = androidModelo.group(1).trim().replaceAll("\\s+", " ");
            if (modelo.length() >= 3 && !modelo.matches("(?i).*(unknown|generic|phone|tablet|^K$).*")) {
                return modelo;
            }
        }

        if (Pattern.compile("\\biPhone\\b", Pattern.CASE_INSENSITIVE).matcher(userAgent).find()) {
            Matcher ver = IPHONE_VERSION.matcher(userAgent);
            if (ver.find()) {
                return "iPhone (iOS " + ver.group(1).replace('_', '.') + ")";
            }
            return "iPhone";
        }
        if (Pattern.compile("\\biPad\\b", Pattern.CASE_INSENSITIVE).matcher(userAgent).find()) {
            return "iPad";
        }
        if (Pattern.compile("\\biPod\\b", Pattern.CASE_INSENSITIVE).matcher(userAgent).find()) {
            return "iPod";
        }
        if (Pattern.compile("\\bWindows\\b", Pattern.CASE_INSENSITIVE).matcher(userAgent).find()) {
            return "Windows PC";
        }
        if (Pattern.compile("\\bMacintosh\\b|\\bMac OS X\\b", Pattern.CASE_INSENSITIVE).matcher(userAgent).find()) {
            return "Mac";
        }
        if (Pattern.compile("\\bAndroid\\b", Pattern.CASE_INSENSITIVE).matcher(userAgent).find()) {
            boolean esMobile = Pattern.compile("\\bMobile\\b", Pattern.CASE_INSENSITIVE).matcher(userAgent).find();
            return esMobile ? "Teléfono Android" : "Tablet Android";
        }
        if (Pattern.compile("\\bLinux\\b", Pattern.CASE_INSENSITIVE).matcher(userAgent).find()) {
            return "Linux";
        }

        return "Dispositivo desconocido";
    }
}
