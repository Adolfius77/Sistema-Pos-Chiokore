import  { Link } from 'react-router-dom'

const SideBar = () => {
    return(
        <div className="sidebar">
            <ul>
                <li>
                    <Link to="/categorias">Categorias</Link>
                </li>
                <li>
                    <Link to="/carrito" className="btn btn-primary">Carrito</Link>
                </li>
            </ul>
        </div>
    )
}
export default SideBar;