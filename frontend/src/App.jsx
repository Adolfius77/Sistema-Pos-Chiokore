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
    clientId: ""
}
function App() {
    const [keycloak, setKeycloak] = useState(null)
    useEffect(() => {
        const initKeycloak = async () =>{
            const keycloakInstance = new Keycloak(KeyCloakOptions);
            try{
                await keycloakInstance.init({ onLoad: "login-required" });
                setKeycloak(keycloakInstance);
                if (keycloakInstance.authenticated) {
                    console.log(keycloakInstance);
                }
            }catch (error){
                console.error("Error initializing Keycloak:", error);
            }
        }
        initKeycloak();
    }, []);
    const handleLogout = () => {
        if(keycloak){
            keycloak.logout();
        }
    }
    return (
        <>
            <Navbar />
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