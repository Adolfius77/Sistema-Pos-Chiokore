import { NavLink } from "react-router-dom";
import { LayoutGrid, ShoppingCart, LogOut } from "lucide-react";
import { TbHeartDiscount } from "react-icons/tb";
import { useCart } from "../context/useCart.js";

const SideBar = ({ onLogout, sidebarOpen, onCloseSidebar }) => {
    const { cartItems } = useCart();
    const cantidadItems = cartItems.reduce((acc, item) => acc + item.cantidad, 0);

    return (
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <ul className="sidebar-menu">
                <li className="menu-item">
                    <NavLink
                        to="/categorias"
                        onClick={onCloseSidebar}
                        className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}
                    >
                        <LayoutGrid size={32} /> Categorías
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink
                        to="/carrito"
                        onClick={onCloseSidebar}
                        className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}
                    >
                        <ShoppingCart size={32} />
                        <span>Carrito</span>
                        {cantidadItems > 0 && (
                            <span className="cart-badge">{cantidadItems}</span>
                        )}
                    </NavLink>
                </li>
                <li className="menu-item">
                    <NavLink
                        to="/promociones"
                        onClick={onCloseSidebar}
                        className={({ isActive }) => `tactile-btn ${isActive ? "active" : ""}`}
                    >
                        <TbHeartDiscount size={32}/> Promociones
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

export default SideBar;
