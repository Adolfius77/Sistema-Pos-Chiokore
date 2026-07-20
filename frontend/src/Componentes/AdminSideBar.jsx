import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, Tags, Receipt, Store, LogOut } from "lucide-react";

const AdminSideBar = ({ onLogout, sidebarOpen }) => {
    return (
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <ul className="sidebar-menu">
                <li className="menu-item">
                    <NavLink to="/admin" end className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}>
                        <LayoutDashboard size={32} /> Inicio
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink to="/admin/productos" className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}>
                        <Package size={32} /> Productos
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink to="/admin/categorias" className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}>
                        <Tags size={32} /> Categorías
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink to="/admin/ventas" className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}>
                        <Receipt size={32} /> Ventas
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink to="/categorias" className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}>
                        <Store size={32} /> Volver al POS
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

export default AdminSideBar;
