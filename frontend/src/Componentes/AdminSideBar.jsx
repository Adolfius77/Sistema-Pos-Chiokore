import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, Tags, Receipt, Tag, LogOut } from "lucide-react";

const AdminSideBar = ({ onLogout, sidebarOpen, onCloseSidebar }) => {
    return (
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <ul className="sidebar-menu">
                <li className="menu-item">
                    <NavLink
                        to="/admin"
                        end
                        onClick={onCloseSidebar}
                        className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}
                    >
                        <LayoutDashboard size={32} /> Inicio
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink
                        to="/admin/productos"
                        onClick={onCloseSidebar}
                        className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}
                    >
                        <Package size={32} /> Productos
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink
                        to="/admin/categorias"
                        onClick={onCloseSidebar}
                        className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}
                    >
                        <Tags size={32} /> Categorías
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink
                        to="/admin/ventas"
                        onClick={onCloseSidebar}
                        className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}
                    >
                        <Receipt size={32} /> Ventas
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink
                        to="/admin/promociones"
                        onClick={onCloseSidebar}
                        className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}
                    >
                        <Tag size={32} /> Promociones
                    </NavLink>
                </li>
            </ul>

            <div className="sidebar-footer">
                <button
                    className="tactile-btn btn-cerrar-sesion"
                    onClick={() => {
                        if (onCloseSidebar) onCloseSidebar();
                        onLogout();
                    }}
                >
                    <LogOut size={32} /> Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};

export default AdminSideBar;
