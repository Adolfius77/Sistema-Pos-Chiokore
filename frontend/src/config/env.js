export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.77:8081";
export const AUTH_TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || "token_pos_chiokore";
export const AUTH_ROLE_STORAGE_KEY = import.meta.env.VITE_AUTH_ROLE_KEY || "rol_pos_chiokore";

export const URL_LOGIN_EXTERNO = import.meta.env.VITE_URL_LOGIN_EXTERNO || "http://192.168.1.77:5175/";
export const URL_LOGOUT_EXTERNO = import.meta.env.VITE_URL_LOGOUT_EXTERNO || "http://192.168.1.77:5175/";

export const urlUpload = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
        return path;
    }
    return `${API_BASE_URL}/uploads/${path}`;
};
