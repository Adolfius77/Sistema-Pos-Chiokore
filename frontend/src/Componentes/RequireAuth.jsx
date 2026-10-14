import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { obtenerSesion } from "../config/sesion.js";

const RequireAuth = ({ children }) => {
    const [estado, setEstado] = useState("verificando");

    useEffect(() => {
        setEstado(obtenerSesion() ? "ok" : "login");
    }, []);

    if (estado === "login") return <Navigate to="/login" replace />;
    if (estado === "ok") return children;
    return null;
};

export default RequireAuth;
