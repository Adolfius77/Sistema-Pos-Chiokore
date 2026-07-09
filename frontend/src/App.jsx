import './styles/app.scss';
import Navbar from "./Componentes/Navbar.jsx";
import SideBar from "./Componentes/sideBar.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import CheckoutEfectivo from "./pages/CheckoutEfectivo.jsx";
import CheckoutTarjeta from "./pages/CheckoutTarjeta.jsx";
import { Routes, Route, Navigate } from "react-router-dom";

import Categorias from "./pages/categorias.jsx";
import Carrito from "./pages/carrito.jsx";
import MetodoPago from "./pages/MetodoPago.jsx";
import { useEffect, useState } from "react";
import { AUTH_TOKEN_STORAGE_KEY } from "./config/env.js";

function App() {
    const [tokenReady, setTokenReady] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState("Cajero");

import { jwtDecode } from "jwt-decode"; // Asegúrate de instalar esto: npm install jwt-decode

// ... dentro del componente App ...

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenUrl = params.get('token');
        let tokenFinal = tokenUrl || localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        
        if (tokenFinal) {
            localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, tokenFinal);
            try {
                const decoded = jwtDecode(tokenFinal);
                setNombreUsuario(decoded.preferred_username || decoded.name || "Cajero");
            } catch (e) {
                console.error("Token inválido", e);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
            setTokenReady(true);
        } else {
            setTokenReady(true);
        }
    }, []);

    if (!tokenReady) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h2>Cargando sistema...</h2>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        window.location.href = "https://url-sistema-externo.com/logout";
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
                        <Route path={"/checkout/efectivo"} element={<CheckoutEfectivo />} />
                        <Route path={"/checkout/tarjeta"} element={<CheckoutTarjeta />} />
                        <Route path="*" element={<Navigate to="/categorias" replace />} />
                    </Routes>
                </div>
            </div>
        </>
    );
}

export default App;
