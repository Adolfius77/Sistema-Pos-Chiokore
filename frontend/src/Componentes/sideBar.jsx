import { NavLink } from 'react-router-dom'
import { TbCategoryFilled } from "react-icons/tb";
import { MdShoppingCart } from "react-icons/md";

const SideBar = ({onLogout}) => {
    return(
        <div className="sidebar">
            <ul className="sidebar-menu">

                <li className="sidebar-item">
                    <NavLink
                        to="/categorias"
                        className={({ isActive }) => isActive ? "sidebar-link active-primary" : "sidebar-link"}
                    >
                        <TbCategoryFilled size={24} className="icon-primary" />
                        Categorías
                    </NavLink>
                </li>

                <li className="sidebar-item">
                    <NavLink
                        to="/carrito"
                        className={({ isActive }) => isActive ? "sidebar-link active-success" : "sidebar-link"}
                    >
                        <MdShoppingCart size={24} className="icon-success" />
                        Carrito
                    </NavLink>
                </li>
                <div className="boton-logout">
                    <input type="button" value="Cerrar Sesion" className="btn-cerar" onClick={onLogout}/>
                </div>
            </ul>
        </div>
    )
}

export default SideBar;