import './styles/app.scss';
import Navbar from "./Componentes/Navbar.jsx";
import SideBar from "./Componentes/sideBar.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import Keycloak from "keycloak-js";

import { Routes, Route, Navigate } from "react-router-dom";

import Categorias from "./pages/categorias.jsx";
import Carrito from "./pages/carrito.jsx";
import { useEffect, useState, useRef } from "react";

const KeyCloakOptions = {
    url: "http://localhost:9090",
    realm: "sistema-pos-chiokore",
    clientId: "react-app-client"
};

function App() {
    const [keycloak, setKeycloak] = useState(null);
    const [autentificado, setAutentificado] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState("");

    const isRun = useRef(false);

    useEffect(() => {

        if (isRun.current) return;
        isRun.current = true;

        const initKeycloak = async () => {
            const keycloakInstance = new Keycloak(KeyCloakOptions);
            try {
                const auth = await keycloakInstance.init({
                    onLoad: "login-required",
                    checkLoginIframe: false
                });


                setKeycloak(keycloakInstance);
                setAutentificado(auth);

                if (auth) {
                    const tokenDatos = keycloakInstance.tokenParsed;
                    setNombreUsuario(tokenDatos.preferred_username || tokenDatos.name);
                }
            } catch (error) {
                console.error("Error initializing Keycloak:", error);
            }
        };

        initKeycloak();
    }, []);

    if (!keycloak) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h2>Desbloqueando sistema...</h2>
            </div>
        );
    }

    const handleLogout = () => {
        if (keycloak) {
            keycloak.logout();
        }
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
                        <Route path="*" element={<Navigate to="/categorias" replace />} />
                    </Routes>
                </div>
            </div>
        </>
    );
}

export default App;