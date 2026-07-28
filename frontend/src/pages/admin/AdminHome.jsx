import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Package, Tags, Receipt, AlertTriangle,
    ShoppingCart, DollarSign, CreditCard, TrendingUp
} from "lucide-react";
import { obtenerResumenVentas } from "../../services/ventasAdmin.js";

const hoyIso = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const AdminHome = () => {
    const navigate = useNavigate();
    const [resumen, setResumen] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        obtenerResumenVentas(hoyIso())
            .then(setResumen)
            .catch(() => setError("No se pudo cargar el resumen del día."));
    }, []);

    const stats = [
        {
            label: "Ventas hoy",
            value: resumen?.numVentas ?? "—",
            icon: ShoppingCart,
            color: "#99462a",
            bg: "#fef3ee",
        },
        {
            label: "Total general",
            value: `$${(resumen?.totalGeneral ?? 0).toFixed(2)}`,
            icon: TrendingUp,
            color: "#166534",
            bg: "#dcfce7",
        },
        {
            label: "Efectivo",
            value: `$${(resumen?.totalEfectivo ?? 0).toFixed(2)}`,
            icon: DollarSign,
            color: "#92400e",
            bg: "#fef3c7",
        },
        {
            label: "Tarjeta",
            value: `$${(resumen?.totalTarjeta ?? 0).toFixed(2)}`,
            icon: CreditCard,
            color: "#3b0764",
            bg: "#f3e8ff",
        },
        {
            label: "Stock bajo",
            value: resumen?.productosStockBajo ?? "—",
            icon: AlertTriangle,
            color: "#991b1b",
            bg: "#fee2e2",
        },
    ];

    return (
        <div className="admin-page">
            <div className="admin-bg-shape" />
            <div className="admin-bg-shape" />
            <div className="admin-bg-shape" />
            <div className="admin-bg-shape" />
            <div className="admin-bg-shape" />
            <div className="admin-bg-shape" />
            <div className="admin-header">
                <div>
                    <h1 className="admin-titulo">Panel de Administración</h1>
                    <p className="admin-subtitulo">Resumen del día y accesos rápidos</p>
                </div>
            </div>

            {error && <p className="admin-error">{error}</p>}

            <div className="admin-resumen-grid">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="admin-stat-card"
                        style={{ backgroundColor: s.bg }}
                    >
                        <div className="stat-icon" style={{ backgroundColor: s.color }}>
                            <s.icon size={20} color="white" />
                        </div>
                        <span className="stat-label">{s.label}</span>
                        <strong className="stat-value" style={{ color: s.color }}>
                            {s.value}
                        </strong>
                    </div>
                ))}
            </div>

            <div className="admin-home-grid">
                <button className="tactile-btn admin-home-card home-card--productos" onClick={() => navigate("/admin/productos")}>
                    <Package size={40} />
                    <span>Productos</span>
                    <p>Alta, edición y stock</p>
                </button>
                <button className="tactile-btn admin-home-card home-card--categorias" onClick={() => navigate("/admin/categorias")}>
                    <Tags size={40} />
                    <span>Categorías</span>
                    <p>Organiza el catálogo</p>
                </button>
                <button className="tactile-btn admin-home-card home-card--ventas" onClick={() => navigate("/admin/ventas")}>
                    <Receipt size={40} />
                    <span>Ventas</span>
                    <p>Historial y tickets</p>
                </button>
            </div>
        </div>
    );
};

export default AdminHome;
