import { NavLink } from 'react-router-dom'
import { TbCategoryFilled } from "react-icons/tb";
import { MdShoppingCart } from "react-icons/md";

const SideBar = () => {
    return(
        <div className="sidebar p-3 bg-light border-end">
            <ul className="nav flex-column">

                <li className="nav-item mb-4">
                    <NavLink
                        to="/categorias"
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-3 ${isActive ? 'active fw-bold text-primary' : 'text-dark'}`
                        }
                    >
                        <TbCategoryFilled size={24} className="text-primary" />
                        Categorías
                    </NavLink>
                </li>

                <li className="nav-item mb-3">
                    <NavLink
                        to="/carrito"
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 ${isActive ? 'active fw-bold text-success' : 'text-dark'}`
                        }
                    >
                        <MdShoppingCart size={24} className="text-success" />
                        Carrito
                    </NavLink>
                </li>

            </ul>
        </div>
    )
}

export default SideBar;