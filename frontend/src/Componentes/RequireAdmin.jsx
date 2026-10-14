import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { obtenerSesion, esAdministrador } from "../config/sesion.js";


const RequireAdmin = ({ children }) => {
    const [estado, setEstado] = useState("verificando");

    useEffect(() => {
        const sesion = obtenerSesion();

        if (!sesion) {
            setEstado("login");
            return;
        }

        setEstado(esAdministrador(sesion) ? "admin" : "categorias");
    }, []);

    if (estado === "login") return <Navigate to="/login" replace />;
    if (estado === "categorias") return <Navigate to="/categorias" replace />;
    if (estado === "admin") return children;
    return null;
};

export default RequireAdmin;
