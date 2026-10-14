import { AUTH_TOKEN_STORAGE_KEY, AUTH_ROLE_STORAGE_KEY } from "./env.js";

/** Lee el payload de un JWT sin verificar la firma. Devuelve null si no se puede. */
export function leerPayloadToken(token) {
    try {
        const partes = token.split(".");
        if (partes.length < 3) return null;
        const payload = partes[1].replace(/-/g, "+").replace(/_/g, "/");
        const relleno = payload + "=".repeat((4 - (payload.length % 4)) % 4);
        return JSON.parse(atob(relleno));
    } catch {
        return null;
    }
}

/** Borra token y rol. Envuelto en try/catch porque localStorage puede fallar. */
export function limpiarSesion() {
    try {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
    } catch {
        /* modo privado o almacenamiento bloqueado: no hay nada que limpiar */
    }
}

/**
 * Devuelve el payload del token guardado si la sesion sirve, o null si no hay
 * token, esta mal formado o ya expiro. En los dos ultimos casos limpia lo que
 * quedo, para no dejar restos que confundan a los guardias.
 */
export function obtenerSesion() {
    let token;
    try {
        token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
        return null;
    }
    if (!token) return null;

    const payload = leerPayloadToken(token);
    if (!payload) {
        limpiarSesion();
        return null;
    }

    // Un token sin exp no se acepta: los que emite este POS siempre lo traen.
    if (!payload.exp || Date.now() / 1000 >= payload.exp) {
        limpiarSesion();
        return null;
    }

    return payload;
}

/**
 * Saca el rol del payload del token. Contempla los distintos nombres de claim
 * que ya manejaba el backend en su conversor de autoridades.
 */
export function rolDeSesion(payload) {
    if (!payload) return null;
    const claim =
        payload.rol ||
        payload.role ||
        payload.roleName ||
        (payload.realm_access && payload.realm_access.roles && payload.realm_access.roles[0]) ||
        null;

    if (Array.isArray(claim)) {
        return claim.includes("ADMINISTRADOR") ? "ADMINISTRADOR" : claim[0] || null;
    }
    return claim;
}

/** True si el token guardado corresponde a un administrador. */
export function esAdministrador(payload) {
    return rolDeSesion(payload) === "ADMINISTRADOR";
}
