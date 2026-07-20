import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Tags, Receipt, AlertTriangle } from "lucide-react";
import { obtenerResumenVentas } from "../../services/ventasAdmin.js";

const hoyIso = () => new Date().toISOString().slice(0, 10);

const AdminHome = () => {
    const navigate = useNavigate();
    const [resumen, setResumen] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        obtenerResumenVentas(hoyIso())
            .then(setResumen)
            .catch(() => setError("No se pudo cargar el resumen del día."));
    }, []);

    return (
        <div className="admin-page">
            <h1 className="admin-titulo">ADMINISTRACIÓN</h1>
            <p className="admin-subtitulo">Resumen del día y accesos rápidos</p>

            {error && <p className="admin-error">{error}</p>}

            <div className="admin-resumen-grid">
                <div className="admin-stat-card">
                    <span>Ventas hoy</span>
                    <strong>{resumen?.numVentas ?? "—"}</strong>
                </div>
                <div className="admin-stat-card">
                    <span>Total general</span>
                    <strong>${(resumen?.totalGeneral ?? 0).toFixed(2)}</strong>
                </div>
                <div className="admin-stat-card">
                    <span>Efectivo</span>
                    <strong>${(resumen?.totalEfectivo ?? 0).toFixed(2)}</strong>
                </div>
                <div className="admin-stat-card">
                    <span>Tarjeta</span>
                    <strong>${(resumen?.totalTarjeta ?? 0).toFixed(2)}</strong>
                </div>
                <div className="admin-stat-card alerta">
                    <span><AlertTriangle size={20} /> Stock bajo</span>
                    <strong>{resumen?.productosStockBajo ?? "—"}</strong>
                </div>
            </div>

            <div className="admin-home-grid">
                <button className="tactile-btn admin-home-card" onClick={() => navigate("/admin/productos")}>
                    <Package size={48} />
                    <span>Productos</span>
                    <p>Alta, edición y stock</p>
                </button>
                <button className="tactile-btn admin-home-card" onClick={() => navigate("/admin/categorias")}>
                    <Tags size={48} />
                    <span>Categorías</span>
                    <p>Organiza el catálogo</p>
                </button>
                <button className="tactile-btn admin-home-card" onClick={() => navigate("/admin/ventas")}>
                    <Receipt size={48} />
                    <span>Ventas</span>
                    <p>Historial y tickets</p>
                </button>
            </div>
        </div>
    );
};

export default AdminHome;
