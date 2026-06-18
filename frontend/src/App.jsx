import './styles/app.scss'
import Navbar from "./Componentes/Navbar.jsx";
import SideBar from "./Componentes/sideBar.jsx";

import Keycloak from "keycloak-js";

import { Routes, Route } from "react-router-dom";

import Categorias from "./pages/categorias.jsx";
import Carrito from "./pages/carrito.jsx";
import {useEffect, useState} from "react";

const KeyCloakOptions = {
    url: "http://localhost:9090",
    realm: "sistema-pos-chiokore",
    clientId: "react-app-client"
}
function App() {
    const [keycloak, setKeycloak] = useState(null)
    const[autentificado, setAutentificado] = useState(false)
    const[nombreUsuario, setNombreUsuario] = useState("")

    useEffect(() => {
        const initKeycloak = async () =>{
            const keycloakInstance = new Keycloak(KeyCloakOptions);
            try{
                const auth = await keycloakInstance.init({ onLoad: "login-required" });
                setKeycloak(keycloakInstance);
                setAutentificado(auth);
                if(auth){
                    const tokenDatos = keycloakInstance.tokenParsed;
                    setNombreUsuario(tokenDatos.preferred_username || tokenDatos.name);
                }
            }catch (error){
                console.error("Error initializing Keycloak:", error);
            }
        }
        initKeycloak();
    }, []);
    if(!keycloak){
        return <div>Cargando...</div>;
    }
    const handleLogout = () => {
        if(keycloak){
            keycloak.logout();
        }
    }
    return (
        <>
            <Navbar nombre={nombreUsuario} onLogout={()=>keycloak.logout()} />
            <div className="flex">
                <SideBar />
                <div className="content">
                    <Routes>
                        <Route path="/categorias" element={<Categorias />} />
                        <Route path="/carrito" element={<Carrito />} />
                    </Routes>
                </div>
            </div>
        </>
    )
}

export default App;