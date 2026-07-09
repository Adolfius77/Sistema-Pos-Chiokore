const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined) return defaultValue;
    return String(value).toLowerCase() === "true";
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
export const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:9090";
export const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || "sistema-pos-chiokore";
export const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "react-app-client";
export const DEFAULT_USUARIO_ID = Number(import.meta.env.VITE_DEFAULT_USUARIO_ID || 1);
export const ENABLE_KEYCLOAK = parseBoolean(import.meta.env.VITE_ENABLE_KEYCLOAK, true);
export const AUTH_TOKEN_STORAGE_KEY = "app_auth_token";
