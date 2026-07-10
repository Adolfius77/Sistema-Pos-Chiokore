import './styles/app.scss';
import Navbar from "./Componentes/Navbar.jsx";
import SideBar from "./Componentes/sideBar.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import CheckoutEfectivo from "./pages/CheckoutEfectivo.jsx";
import CheckoutTarjeta from "./pages/CheckoutTarjeta.jsx";
import Categorias from "./pages/categorias.jsx";
import Carrito from "./pages/carrito.jsx";
import MetodoPago from "./pages/MetodoPago.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AUTH_TOKEN_STORAGE_KEY, URL_LOGIN_EXTERNO, URL_LOGOUT_EXTERNO } from "./config/env.js";

function App() {
    const [tokenReady, setTokenReady] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState("Cajero");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenUrl = params.get('token');
        let tokenFinal = tokenUrl || localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

        if (tokenFinal) {
            try {
                const decoded = jwtDecode(tokenFinal);
                localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, tokenFinal);
                setNombreUsuario(decoded.preferred_username || decoded.name || "Cajero");
                window.history.replaceState({}, document.title, window.location.pathname);
                setTokenReady(true);
            } catch (e) {
                console.error("Token inválido o expirado:", e);
                localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
                window.location.href = URL_LOGIN_EXTERNO;
            }
        } else {
            console.warn("No hay token y no hay URL de login externo definida.");
            setTokenReady(true);
        }
    }, []);

    if (!tokenReady) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <h2>Cargando sistema...</h2>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        window.location.href = URL_LOGOUT_EXTERNO;
    };

    return (
        <>
            <Navbar nombre={nombreUsuario} />
            <div className="flex">
                <SideBar onLogout={handleLogout}/>
                <div className="content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/categorias" replace />} />
                        <Route path="/categorias" element={<Categorias />} />
                        <Route path="/catalogo/:id" element={<Catalogo />} />
                        <Route path="/carrito" element={<Carrito />} />
                        <Route path="/metodopago" element={<MetodoPago />} />
                        <Route path="/checkout/efectivo" element={<CheckoutEfectivo />} />
                        <Route path="/checkout/tarjeta" element={<CheckoutTarjeta />} />
                        <Route path="*" element={<Navigate to="/categorias" replace />} />
                    </Routes>
                </div>
            </div>
        </>
    );
}

export default App;