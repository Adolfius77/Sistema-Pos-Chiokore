import './styles/app.scss';
import Navbar from "./Componentes/Navbar.jsx";
import SideBar from "./Componentes/sideBar.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import Keycloak from "keycloak-js";
import CheckoutEfectivo from "./pages/CheckoutEfectivo.jsx";
import CheckoutTarjeta from "./pages/CheckoutTarjeta.jsx";
import { Routes, Route, Navigate } from "react-router-dom";

import Categorias from "./pages/categorias.jsx";
import Carrito from "./pages/carrito.jsx";
import MetodoPago from "./pages/MetodoPago.jsx";
import { useEffect, useState, useRef } from "react";
import {
    AUTH_TOKEN_STORAGE_KEY,
    ENABLE_KEYCLOAK,
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_REALM,
    KEYCLOAK_URL
} from "./config/env.js";

const KeyCloakOptions = {
    url: KEYCLOAK_URL,
    realm: KEYCLOAK_REALM,
    clientId: KEYCLOAK_CLIENT_ID
};

function App() {
    const [keycloak, setKeycloak] = useState(null);
    const [autentificado, setAutentificado] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState(ENABLE_KEYCLOAK ? "" : "Cajero local");
    const [appLista, setAppLista] = useState(!ENABLE_KEYCLOAK);
    const [errorAuth, setErrorAuth] = useState("");

    const isRun = useRef(false);

    useEffect(() => {
        if (isRun.current) return;
        isRun.current = true;

        if (!ENABLE_KEYCLOAK) return;

        const initKeycloak = async () => {
            const keycloakInstance = new Keycloak(KeyCloakOptions);
            try {
                const auth = await keycloakInstance.init({
                    onLoad: "login-required",
                    checkLoginIframe: false
                });


                if (auth) {
                    const tokenDatos = keycloakInstance.tokenParsed || {};
                    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, keycloakInstance.token || "");
                    setNombreUsuario(tokenDatos.preferred_username || tokenDatos.name);
                }
                setKeycloak(keycloakInstance);
                setAutentificado(auth);
            } catch (error) {
                console.error("Error al inicializar Keycloak:", error);
                localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
                setErrorAuth("No se pudo validar la sesión. Se habilitó modo local.");
                setNombreUsuario("Cajero local");
            } finally {
                setAppLista(true);
            }
        };

        initKeycloak();
    }, []);

    useEffect(() => {
        if (!keycloak || !autentificado) return undefined;

        const interval = setInterval(async () => {
            try {
                await keycloak.updateToken(30);
                if (keycloak.token) {
                    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, keycloak.token);
                }
            } catch (error) {
                console.error("No se pudo refrescar el token:", error);
            }
        }, 25000);

        return () => clearInterval(interval);
    }, [autentificado, keycloak]);

    if (!appLista) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h2>Desbloqueando sistema...</h2>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        if (keycloak && autentificado) {
            keycloak.logout({ redirectUri: window.location.origin });
        } else {
            window.location.reload();
        }
    };

    return (
        <>
            <Navbar nombre={nombreUsuario} />
            {errorAuth && <div className="warning-banner">{errorAuth}</div>}
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