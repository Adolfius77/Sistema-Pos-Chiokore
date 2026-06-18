const Navbar = ({ nombre }) => {
    return (
        <div className="navbar">
            <div className="logo">
                <h2>CHIOKORE</h2>
            </div>

            <div className="user-info">
                <span>Trabajador: {nombre}</span>
            </div>
        </div>
    )
}

export default Navbar;