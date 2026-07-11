import { Volume2, VolumeX, User } from "lucide-react";
import { useState } from "react";

const Navbar = ({ nombre }) => {
    const [audioActivado, setAudioActivado] = useState(true);

    return (
        <header className="navbar">
            <div className="navbar-brand">CHIOKORE</div>

            <div className="navbar-controls">
                <button
                    className="tactile-btn btn-volume"
                    onClick={() => setAudioActivado(!audioActivado)}
                >
                    {audioActivado ? <Volume2 size={32}/> : <VolumeX size={32}/>}
                </button>

                <div className="tactile-btn user-profile">
                    <div className="user-avatar">
                        <User size={30} />
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