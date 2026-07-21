import './styles/app.scss';
import Navbar from "./Componentes/Navbar.jsx";
import SideBar from "./Componentes/sideBar.jsx";
import AdminLayout from "./Componentes/AdminLayout.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import CheckoutEfectivo from "./pages/CheckoutEfectivo.jsx";
import CheckoutTarjeta from "./pages/CheckoutTarjeta.jsx";
import Categorias from "./pages/categorias.jsx";
import Carrito from "./pages/carrito.jsx";
import MetodoPago from "./pages/MetodoPago.jsx";
import Promociones from "./pages/Promociones.jsx";
import Login from "./pages/Login.jsx";
import AdminHome from "./pages/admin/AdminHome.jsx";
import AdminProductos from "./pages/admin/AdminProductos.jsx";
import AdminProductoForm from "./pages/admin/AdminProductoForm.jsx";
import AdminCategorias from "./pages/admin/AdminCategorias.jsx";
import AdminVentas from "./pages/admin/AdminVentas.jsx";
import AdminVentaDetalle from "./pages/admin/AdminVentaDetalle.jsx";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AUTH_TOKEN_STORAGE_KEY, URL_LOGIN_EXTERNO, URL_LOGOUT_EXTERNO } from "./config/env.js";
import { useIdleTimer } from "./hooks/useIdleTimer.js";
import IdleOverlay from "./Componentes/IdleOverlay.jsx";

function PosLayout({ onLogout, sidebarOpen, onCloseSidebar }) {
    return (
        <div className="flex">
            {sidebarOpen && <div className="sidebar-overlay" onClick={onCloseSidebar} />}
            <SideBar onLogout={onLogout} sidebarOpen={sidebarOpen} />
            <div className="content" onClick={onCloseSidebar}>
                <Outlet />
            </div>
        </div>
    );
}

function App() {
    const [tokenReady, setTokenReady] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState("Cajero");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Configurar inactividad: 60 segundos
    const isIdle = useIdleTimer(60000);

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

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <>
            {isIdle && <IdleOverlay />}
            <Navbar nombre={nombreUsuario} onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/admin"
                    element={
                        <AdminLayout
                            onLogout={handleLogout}
                            sidebarOpen={sidebarOpen}
                            onCloseSidebar={closeSidebar}
                        />
                    }
                >
                    <Route index element={<AdminHome />} />
                    <Route path="productos" element={<AdminProductos />} />
                    <Route path="productos/nuevo" element={<AdminProductoForm />} />
                    <Route path="productos/:id" element={<AdminProductoForm />} />
                    <Route path="categorias" element={<AdminCategorias />} />
                    <Route path="ventas" element={<AdminVentas />} />
                    <Route path="ventas/:id" element={<AdminVentaDetalle />} />
                </Route>

                <Route
                    element={
                        <PosLayout
                            onLogout={handleLogout}
                            sidebarOpen={sidebarOpen}
                            onCloseSidebar={closeSidebar}
                        />
                    }
                >
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/categorias" element={<Categorias />} />
                    <Route path="/catalogo/:id" element={<Catalogo />} />
                    <Route path="/carrito" element={<Carrito />} />
                    <Route path="/metodopago" element={<MetodoPago />} />
                    <Route path="/checkout/efectivo" element={<CheckoutEfectivo />} />
                    <Route path="/checkout/tarjeta" element={<CheckoutTarjeta />} />
                    <Route path="/promociones" element={<Promociones />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;
