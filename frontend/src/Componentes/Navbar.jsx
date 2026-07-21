import { Volume2, VolumeX, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { sound } from "../utils/sound.js";

const Navbar = ({ nombre, onToggleSidebar, sidebarOpen }) => {
    const [audioActivado, setAudioActivado] = useState(() => {
        const saved = localStorage.getItem("AUDIO_ENABLED");
        return saved === null ? true : saved === "true";
    });

    const toggleAudio = () => {
        setAudioActivado(prev => {
            const newVal = !prev;
            localStorage.setItem("AUDIO_ENABLED", String(newVal));
            if (newVal) {
                // Play a test sound to show audio is active
                setTimeout(() => sound.playClick(), 50);
            }
            return newVal;
        });
    };

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
                <button
                    className="tactile-btn btn-volume"
                    onClick={toggleAudio}
                >
                    {audioActivado ? <Volume2 size={32}/> : <VolumeX size={32}/>}
                </button>

                <div className="tactile-btn user-profile">
                    <div className="user-avatar">
                        <User size={28} />
                    </div>
                    <div className="user-info">
                        <span className="user-name">{nombre}</span>
                        <span className="user-shift">Turno Mañana</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;