import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Package, Tags, Receipt, AlertTriangle,
    ShoppingCart, DollarSign, CreditCard, TrendingUp,
    ChevronDown, ChevronUp, X, PackageCheck
} from "lucide-react";
import { obtenerResumenVentas } from "../../services/ventasAdmin.js";
import { listarProductos } from "../../services/productos.js";

const hoyIso = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const STOCK_BAJO_UMBRAL = 5;

const NotificacionStockBajo = ({ productos, onNavigate }) => {
    const [abierto, setAbierto] = useState(false);
    const [saliendo, setSaliendo] = useState(false);
    const [descartado, setDescartado] = useState(false);

    const stockBajo = productos
        .filter(p => p.activo && p.stock !== null && p.stock <= STOCK_BAJO_UMBRAL)
        .sort((a, b) => (a.stock || 0) - (b.stock || 0));

    if (stockBajo.length === 0 || descartado) return null;

    const handleDescartar = (e) => {
        e.stopPropagation();
        setSaliendo(true);
        setTimeout(() => setDescartado(true), 300);
    };

    return (
        <div className={`admin-stock-alert ${abierto ? "admin-stock-alert--abierto" : ""} ${saliendo ? "admin-stock-alert--saliendo" : ""}`}>
            <div
                className="admin-stock-alert__header"
                onClick={() => setAbierto(!abierto)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setAbierto(!abierto)}
            >
                <div className="admin-stock-alert__header-left">
                    <div className="admin-stock-alert__icon-box">
                        <AlertTriangle size={18} />
                    </div>
                    <div className="admin-stock-alert__titles">
                        <h4 className="admin-stock-alert__title">Atención de Inventario</h4>
                        <p className="admin-stock-alert__subtitle">
                            {stockBajo.length} producto{stockBajo.length > 1 ? "s requieren reabastecimiento" : " requiere reabastecimiento"}
                        </p>
                    </div>
                </div>

                <div className="admin-stock-alert__header-right">
                    <span className="admin-stock-alert__badge">{stockBajo.length}</span>
                    <div className="admin-stock-alert__chevron">
                        {abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                </div>
            </div>

            {abierto && (
                <div className="admin-stock-alert__body">
                    <div className="admin-stock-alert__grid">
                        {stockBajo.slice(0, 8).map((p) => {
                            const esCritico = p.stock <= 1;
                            return (
                                <div
                                    key={p.id}
                                    className={`admin-stock-alert__item ${esCritico ? "critico" : ""}`}
                                >
                                    <PackageCheck size={16} className="admin-stock-alert__item-icon" />
                                    <div className="admin-stock-alert__item-info">
                                        <span className="admin-stock-alert__item-nombre">{p.nombre}</span>
                                        <span className="admin-stock-alert__item-cat">
                                            {p.categoria?.nombre || "Sin categoría"}
                                        </span>
                                    </div>
                                    <span className={`admin-stock-alert__pill ${esCritico ? "critico" : ""}`}>
                                        {p.stock === 0 ? "Agotado" : `${p.stock} uds`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="admin-stock-alert__footer">
                        {stockBajo.length > 8 && (
                            <span className="admin-stock-alert__more">
                                +{stockBajo.length - 8} productos más en riesgo
                            </span>
                        )}
                        <div className="admin-stock-alert__actions">
                            <button
                                type="button"
                                className="admin-stock-alert__btn-ir"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate && onNavigate("/admin/productos");
                                }}
                            >
                                <Package size={14} />
                                Gestionar Productos
                            </button>
                            <button
                                type="button"
                                className="admin-stock-alert__btn-ocultar"
                                onClick={handleDescartar}
                            >
                                <X size={14} />
                                Ocultar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminHome = () => {
    const navigate = useNavigate();
    const [resumen, setResumen] = useState(null);
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            obtenerResumenVentas(hoyIso()),
            listarProductos()
        ])
            .then(([res, prods]) => {
                setResumen(res);
                setProductos(prods);
            })
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

            <NotificacionStockBajo productos={productos} onNavigate={navigate} />

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
