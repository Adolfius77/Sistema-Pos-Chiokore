import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Power, Trash2 } from "lucide-react";
import apiCliente from "../../config/api";
import { urlUpload } from "../../config/env.js";

//metodo para leer el mensaje que manda el backend
const mensajeError = (e, fallback) =>
    e?.response?.data?.error || e?.response?.data?.mensaje || fallback;

const AdminPromociones = () => {
    const navigate = useNavigate();
    const [promociones, setPromociones] = useState([]);
    const [error, setError] = useState("");

    const cargar = async () => {
        try {
            const res = await apiCliente.get("/promociones");
            setPromociones(Array.isArray(res.data) ? res.data : []);
            setError("");
        } catch (e) {
            setError(mensajeError(e, "No se pudieron cargar las promociones."));
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const toggleActivo = async (promo) => {
        try {
            await apiCliente.patch(`/promociones/${promo.id}/activo`, { activo: !promo.activo });
            setError("");
            await cargar();
        } catch (e) {
            setError(mensajeError(e, "No se pudo cambiar el estado de la promoción."));
        }
    };

    const eliminarPromo = async (promo) => {
        if (!window.confirm(`¿Eliminar la promoción "${promo.nombre}"?`)) return;
        try {
            await apiCliente.delete(`/promociones/${promo.id}`);
            setError("");
            await cargar();
        } catch (e) {
            setError(mensajeError(e, "No se pudo eliminar la promoción."));
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1 className="admin-titulo">PROMOCIONES</h1>
                <button className="tactile-btn admin-btn-primary" onClick={() => navigate("/admin/promociones/nuevo")}>
                    Nueva promoción
                </button>
            </div>
            {error && <p className="admin-error">{error}</p>}

            <div className="admin-lista">
                {promociones.map(p => (
                    <div key={p.id} className={`admin-lista-item ${p.activo ? "" : "inactivo"}`}>
                        <img src={urlUpload(p.url_imagen) || "https://placehold.co/120x120/eeeeee/666666?text=Sin+Foto"} alt={p.nombre} className="admin-lista-foto" />
                        <div className="admin-lista-info">
                            <h2>{p.nombre}</h2>
                            <p>{p.cantidadPaquete} piezas por ${Number(p.precioPaquete).toFixed(2)}</p>
                            <span className={`admin-badge ${p.activo ? "ok" : "off"}`}>{p.activo ? "Activo" : "Inactivo"}</span>
                        </div>
                        <div className="admin-lista-acciones">
                            <button className="tactile-btn admin-btn-secondary admin-btn-edit" onClick={() => navigate(`/admin/promociones/editar/${p.id}`)}>
                                <Pencil size={16} />
                                Editar
                            </button>
                            <button className="tactile-btn admin-btn-secondary admin-btn-toggle" onClick={() => toggleActivo(p)}>
                                <Power size={16} />
                                {p.activo ? "Desactivar" : "Activar"}
                            </button>
                            <button className="tactile-btn admin-btn-danger" onClick={() => eliminarPromo(p)}>
                                <Trash2 size={16} />
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default AdminPromociones;
