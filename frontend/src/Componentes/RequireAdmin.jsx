import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AUTH_TOKEN_STORAGE_KEY, AUTH_ROLE_STORAGE_KEY } from "../config/env.js";

function decodeJwtPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
        const json = atob(padded);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

const RequireAdmin = ({ children }) => {
    const [estado, setEstado] = useState("verificando");

    useEffect(() => {
        const roleStored = localStorage.getItem(AUTH_ROLE_STORAGE_KEY);
        if (roleStored === "ADMINISTRADOR") {
            setEstado("admin");
            return;
        }

        const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        if (!token) {
            setEstado("login");
            return;
        }

        const decoded = decodeJwtPayload(token);
        if (!decoded) {
            setEstado("categorias");
            return;
        }

        // check expiration
        if (decoded.exp && Date.now() / 1000 > decoded.exp) {
            localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
            localStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
            setEstado("login");
            return;
        }

        // Common places for role claims
        const roleClaim = decoded.rol || decoded.role || decoded.roleName || (decoded.realm_access && decoded.realm_access.roles && decoded.realm_access.roles[0]) || null;

        if (roleClaim === "ADMINISTRADOR" || (Array.isArray(roleClaim) && roleClaim.includes("ADMINISTRADOR"))) {
            setEstado("admin");
            return;
        }

        setEstado("categorias");
    }, []);

    if (estado === "login") return <Navigate to="/login" replace />;
    if (estado === "categorias") return <Navigate to="/categorias" replace />;
    if (estado === "admin") return children;
    return null;
};

export default RequireAdmin;