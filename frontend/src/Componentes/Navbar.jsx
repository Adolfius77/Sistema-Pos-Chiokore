import { User, Menu, X } from "lucide-react";

const Navbar = ({ nombre, onToggleSidebar, sidebarOpen }) => {
    return (
        <header className="navbar">
            <div className="navbar-brand">
                <button className="menu-toggle-btn" onClick={onToggleSidebar}>
                    {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
                <img src="/LogoChio.png" alt="Logo Chiokore" className="brand-logo" />

                <div className="brand-text">
                    <h1 className="brand-titulo">Chiokore</h1>
                    <span className="brand-subtitle">BAZAR CON CAUSA</span>
                </div>
            </div>

            <div className="navbar-controls">
                <div className="tactile-btn user-profile">
                    <div className="user-avatar">
                        <User size={28} />
                    </div>
                    <div className="user-info">
                        <span className="user-name">{nombre}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;