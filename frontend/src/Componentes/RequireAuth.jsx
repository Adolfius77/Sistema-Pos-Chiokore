import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AUTH_TOKEN_STORAGE_KEY } from "../config/env.js";

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

const RequireAuth = ({ children }) => {
    const [estado, setEstado] = useState("verificando");

    useEffect(() => {
        const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        if (!token) {
            setEstado("login");
            return;
        }

        const decoded = decodeJwtPayload(token);
        if (!decoded || (decoded.exp && Date.now() / 1000 > decoded.exp)) {
            localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
            setEstado("login");
            return;
        }

        setEstado("ok");
    }, []);

    if (estado === "login") return <Navigate to="/login" replace />;
    if (estado === "ok") return children;
    return null;
};

export default RequireAuth;