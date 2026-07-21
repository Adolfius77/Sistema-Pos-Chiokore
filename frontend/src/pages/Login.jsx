import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const users = [
        { id: 1, name: "Adolfo", initial: "C1" },
        { id: 2, name: "Pedro", initial: "C2" },
        { id: 3, name: "Angel", initial: "C3" },
        {id: 4, name: "Carlos", initial: "C4"},
    ];

    const handleLogin = (user) => {
        // Aquí iría la lógica de autenticación real
        console.log("Iniciando sesión como:", user.name);
        navigate("/categorias");
    };

    return (
        <div className="login-container">
            <h1>Bienvenido a Chiokore</h1>
            <div className="users-grid">
                {users.map((user) => (
                    <button key={user.id} className="user-card" onClick={() => handleLogin(user)}>
                        <div className="avatar">{user.initial}</div>
                        <span>{user.name}</span>
                    </button>
                ))}
            </div>
            <button className="admin-btn" onClick={() => navigate("/admin")}>
                Acceso Administrador
            </button>
        </div>
    );
};

export default Login;
