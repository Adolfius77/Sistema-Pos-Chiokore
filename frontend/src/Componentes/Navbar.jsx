const Navbar = ({ nombre, onLogout }) => {
    return (
        <div className="navbar">
            <div className="logo">
                <h2>CHIOKORE</h2>
            </div>

            <div className="user-info">
                <span>Trabajador: {nombre}</span>
                <button onClick={onLogout} className="btn-logout">
                    Cerrar Sesión
                </button>
            </div>
        </div>
    )
}

export default Navbar;