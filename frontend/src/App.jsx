import './styles/app.scss'
import Navbar from "./Componentes/Navbar.jsx";
import SideBar from "./Componentes/sideBar.jsx";

import { Routes, Route } from "react-router-dom";

import Categorias from "./pages/categorias.jsx";
import Carrito from "./pages/carrito.jsx";

function App() {
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