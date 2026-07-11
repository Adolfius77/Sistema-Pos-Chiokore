import { NavLink } from "react-router-dom";
import { LayoutGrid, ShoppingCart, LogOut } from "lucide-react";

const SideBar = ({ onLogout }) => {
    return (
        <nav className="sidebar">
            <ul className="sidebar-menu">
                <li className="menu-item">
                    <NavLink to="/categorias" className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}>
                        <LayoutGrid size={32} /> Categorías
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink to="/carrito" className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}>
                        <ShoppingCart size={32} /> Carrito
                    </NavLink>
                </li>
            </ul>

            <div className="sidebar-footer">
                <button className="tactile-btn btn-cerrar-sesion" onClick={onLogout}>
                    <LogOut size={32} /> Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};

export default SideBar;