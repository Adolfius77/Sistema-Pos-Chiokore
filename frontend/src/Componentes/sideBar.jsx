import  { Link } from 'react-router-dom'

const SideBar = () => {
    return(
        <div className="sidebar">
            <ul>
                <li>
                    <Link to="">categorias</Link>
                </li>
                <li>
                    <Link to="">carrito</Link>
                </li>
            </ul>
        </div>
    )
}
export default SideBar;