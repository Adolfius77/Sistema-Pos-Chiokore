const IdleOverlay = ({ onClick }) => {
    return (
        <div className="idle-overlay" onClick={onClick}>
            <div className="idle-content">
                <img src="/LogoChio.png" alt="Logo Chiokore" className="idle-logo" />
                <h1>Chiokore</h1>
                <p>Pulsa en cualquier parte para continuar</p>
            </div>
        </div>
    );
};

export default IdleOverlay;
