import React from "react";
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
    } catch (e) {
        return null;
    }
}

const RequireAdmin = ({ children }) => {
    const roleStored = localStorage.getItem(AUTH_ROLE_STORAGE_KEY);
    if (roleStored && roleStored === "ADMINISTRADOR") return children;

    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) return <Navigate to="/login" replace />;

    const decoded = decodeJwtPayload(token);
    if (!decoded) return <Navigate to="/categorias" replace />;

    // check expiration
    if (decoded.exp && Date.now() / 1000 > decoded.exp) {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
        return <Navigate to="/login" replace />;
    }

    // Common places for role claims
    const roleClaim = decoded.rol || decoded.role || decoded.roleName || (decoded.realm_access && decoded.realm_access.roles && decoded.realm_access.roles[0]) || null;

    if (roleClaim === "ADMINISTRADOR" || (Array.isArray(roleClaim) && roleClaim.includes("ADMINISTRADOR"))) {
        return children;
    }

    return <Navigate to="/categorias" replace />;
};

export default RequireAdmin;