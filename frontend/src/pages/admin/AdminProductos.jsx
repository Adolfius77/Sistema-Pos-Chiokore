import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarProductos, cambiarActivoProducto } from "../../services/productos.js";
import { urlUpload } from "../../config/env.js";

const AdminProductos = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(true);

    const cargar = async () => {
        try {
            setCargando(true);
            setProductos(await listarProductos());
            setError("");
        } catch {
            setError("No se pudieron cargar los productos.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const toggleActivo = async (producto) => {
        try {
            await cambiarActivoProducto(producto.id, !producto.activo);
            await cargar();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-titulo">PRODUCTOS</h1>
                    <p className="admin-subtitulo">Gestiona el inventario del bazar</p>
                </div>
                <button className="tactile-btn admin-btn-primary" onClick={() => navigate("/admin/productos/nuevo")}>
                    Nuevo producto
                </button>
            </div>

            {error && <p className="admin-error">{error}</p>}
            {cargando && <p className="admin-subtitulo">Cargando...</p>}

            <div className="admin-lista">
                {productos.map((p) => (
                    <div key={p.id} className={`admin-lista-item ${p.activo ? "" : "inactivo"}`}>
                        <img
                            src={urlUpload(p.url_imagen) || "https://placehold.co/120x120/eeeeee/666666?text=Sin+Foto"}
                            alt={p.nombre}
                            className="admin-lista-foto"
                        />
                        <div className="admin-lista-info">
                            <h2>{p.nombre}</h2>
                            <p>
                                ${Number(p.precio).toFixed(2)} · Stock: {p.stock}
                                {p.categoria?.nombre ? ` · ${p.categoria.nombre}` : ""}
                            </p>
                            <span className={`admin-badge ${p.activo ? "ok" : "off"}`}>
                                {p.activo ? "Activo" : "Inactivo"}
                            </span>
                        </div>
                        <div className="admin-lista-acciones">
                            <button className="tactile-btn admin-btn-secondary" onClick={() => navigate(`/admin/productos/${p.id}`)}>
                                Editar
                            </button>
                            <button className="tactile-btn admin-btn-secondary" onClick={() => toggleActivo(p)}>
                                {p.activo ? "Desactivar" : "Activar"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminProductos;
