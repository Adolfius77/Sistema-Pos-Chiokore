import { NavLink } from 'react-router-dom'
import { TbCategoryFilled } from "react-icons/tb";
import { MdShoppingCart, MdLogout } from "react-icons/md";

const SideBar = ({ onLogout }) => {
    return(
        <div className="sidebar">
            <ul className="sidebar-menu">
                <li className="sidebar-item">
                    <NavLink
                        to="/categorias"
                        className={({ isActive }) => isActive ? "sidebar-link active-primary" : "sidebar-link"}
                    >
                        <TbCategoryFilled size={24} className="icon-primary" />
                        <span>Categorías</span>
                    </NavLink>
                </li>

                <li className="sidebar-item">
                    <NavLink
                        to="/carrito"
                        className={({ isActive }) => isActive ? "sidebar-link active-success" : "sidebar-link"}
                    >
                        <MdShoppingCart size={24} className="icon-success" />
                        <span>Carrito</span>
                    </NavLink>
                </li>
            </ul>

            <div className="sidebar-footer">
                <button className="btn-cerrar" onClick={onLogout}>
                    <MdLogout size={22} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    )
}

export default SideBar;