import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiCliente from "../../config/api";
import { urlUpload } from "../../config/env.js";

const AdminPromociones = () => {
    const navigate = useNavigate();
    const [promociones, setPromociones] = useState([]);

    const cargar = async () => {
        try {
            const res = await apiCliente.get("/promociones");
            setPromociones(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error al cargar:", error);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const toggleActivo = async (promo) => {
        await apiCliente.patch(`/promociones/${promo.id}/activo`, { activo: !promo.activo });
        cargar();
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1 className="admin-titulo">PROMOCIONES</h1>
                <button className="tactile-btn admin-btn-primary" onClick={() => navigate("/admin/promociones/nuevo")}>
                    Nueva promoción
                </button>
            </div>
            <div className="admin-lista">
                {promociones.map(p => (
                    <div key={p.id} className={`admin-lista-item ${p.activo ? "" : "inactivo"}`}>
                        <img src={urlUpload(p.url_imagen)} className="admin-lista-foto" />
                        <div className="admin-lista-info">
                            <h2>{p.nombre}</h2>
                            <p>${p.precioPaquete} x {p.cantidadPaquete}</p>
                            <span className={`admin-badge ${p.activo ? "ok" : "off"}`}>{p.activo ? "Activo" : "Inactivo"}</span>
                        </div>
                        <div className="admin-lista-acciones">
                            <button className="tactile-btn admin-btn-secondary" onClick={() => navigate(`/admin/promociones/editar/${p.id}`)}>Editar</button>
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
export default AdminPromociones;
