import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import apiCliente from "../config/api.js";
import { AUTH_TOKEN_STORAGE_KEY, AUTH_ROLE_STORAGE_KEY } from "../config/env.js";

const Login = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [adminTarget, setAdminTarget] = useState(null);
    const [claveAdmin, setClaveAdmin] = useState("");
    const [pagina, setPagina] = useState(0);
    const usuariosPorPagina = 4;

    useEffect(() => {
        apiCliente.get("/pos/auth/usuarios")
            .then((res) => setUsuarios(res.data))
            .catch(() => setError("No se pudieron cargar los usuarios."))
            .finally(() => setCargando(false));
    }, []);

    const handleLogin = async (usuario) => {
        try {
            setError("");
            const res = await apiCliente.post(`/pos/auth/login/${usuario.idAsistencia}`, {});
            const { token, rol } = res.data;

            localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
            try { localStorage.setItem(AUTH_ROLE_STORAGE_KEY, rol); } catch(e) {}
            window.location.href = rol === "ADMINISTRADOR" ? "/admin" : "/categorias";
        } catch (err) {
            const msg = err?.response?.data?.error || "Error al iniciar sesión.";
            setError(msg);
        }
    };

    const handleAdminLogin = async () => {
        if (!adminTarget || !claveAdmin.trim()) return;

        try {
            setError("");
            const res = await apiCliente.post(`/pos/auth/login/${adminTarget.idAsistencia}`, {
                clave: claveAdmin,
            });
            const { token, rol } = res.data;

            localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
            try { localStorage.setItem(AUTH_ROLE_STORAGE_KEY, rol); } catch(e) {}
            window.location.href = rol === "ADMINISTRADOR" ? "/admin" : "/categorias";
            setAdminTarget(null);
            setClaveAdmin("");
        } catch (err) {
            const msg = err?.response?.data?.error || "Error al iniciar sesión.";
            setError(msg);
            setClaveAdmin("");
        }
    };

    const totalPaginas = Math.ceil(usuarios.length / usuariosPorPagina);
    const usuariosPagina = usuarios.slice(pagina * usuariosPorPagina, (pagina + 1) * usuariosPorPagina);

    const clickUsuario = (user) => {
        setError("");
        if (user.rol === "ADMINISTRADOR") {
            setAdminTarget(user);
            setClaveAdmin("");
        } else {
            handleLogin(user);
        }
    };

    if (cargando) {
        return (
            <div className="login-container">
                <h1>Bienvenido a Chiokore</h1>
                <p className="login-loading">Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className="login-container">
            {[...Array(8)].map((_, i) => <div key={i} className={`bg-shape bg-shape--${i + 1}`} />)}
            <h1>Bienvenido a Chiokore</h1>

            {adminTarget ? (
                <div className="admin-clave-modal">
                    <div className="admin-clave-card">
                        <FaLock className="admin-clave-icon" />
                        <h2>Clave de Administrador</h2>
                        <p>Ingresa la clave para <strong>{adminTarget.nombre}</strong></p>
                        {error && <p className="login-error">{error}</p>}
                        <input
                            type="password"
                            className="admin-clave-input"
                            placeholder="Clave de acceso"
                            value={claveAdmin}
                            onChange={(e) => setClaveAdmin(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); }}
                        />
                        <div className="admin-clave-acciones">
                            <button className="btn-secundario" onClick={() => { setAdminTarget(null); setClaveAdmin(""); }}>
                                Cancelar
                            </button>
                            <button className="btn-cobrar" onClick={handleAdminLogin} disabled={!claveAdmin.trim()}>
                                Ingresar
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {error && <p className="login-error">{error}</p>}
                    <div className="carousel-wrapper">
                        <button
                            className="carousel-btn carousel-btn--left"
                            disabled={pagina === 0}
                            onClick={() => setPagina(p => p - 1)}
                            aria-label="Anterior"
                        >
                            ‹
                        </button>
                        <div className="users-grid">
                            {usuariosPagina.map((user) => (
                                <button
                                    key={user.idAsistencia}
                                    className="user-card"
                                    onClick={() => clickUsuario(user)}
                                >
                                    <div className="avatar">{user.initial}</div>
                                    <span>{user.nombre}</span>
                                    <small className="user-rol">{user.rol}</small>
                                </button>
                            ))}
                        </div>
                        <button
                            className="carousel-btn carousel-btn--right"
                            disabled={pagina >= totalPaginas - 1}
                            onClick={() => setPagina(p => p + 1)}
                            aria-label="Siguiente"
                        >
                            ›
                        </button>
                    </div>
                    {totalPaginas > 1 && (
                        <div className="carousel-dots">
                            {[...Array(totalPaginas)].map((_, i) => (
                                <button
                                    key={i}
                                    className={`carousel-dot${i === pagina ? " carousel-dot--active" : ""}`}
                                    onClick={() => setPagina(i)}
                                    aria-label={`Página ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {usuarios.length === 0 && !error && !adminTarget && (
                <p className="login-empty">
                    No hay usuarios registrados en el sistema.
                </p>
            )}
        </div>
    );
};

export default Login;
