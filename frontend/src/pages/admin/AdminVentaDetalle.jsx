import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, XCircle } from "lucide-react";
import { obtenerVentaDetalle, cancelarVenta } from "../../services/ventasAdmin.js";
import { urlUpload } from "../../config/env.js";

const formatearFecha = (fechaHora) => {
    if (!fechaHora) return "—";
    try {
        const fecha = new Date(fechaHora);
        if (Number.isNaN(fecha.getTime())) return fechaHora;
        return new Intl.DateTimeFormat("es-MX", {
            dateStyle: "full",
            timeStyle: "medium",
            hour12: false,
        }).format(fecha);
    } catch {
        return fechaHora;
    }
};

const AdminVentaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [venta, setVenta] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        obtenerVentaDetalle(id)
            .then(setVenta)
            .catch((e) => setError(e.message));
    }, [id]);

    if (error) {
        return (
            <div className="admin-page">
                <p className="admin-error">{error}</p>
                <button className="tactile-btn admin-btn-secondary" onClick={() => navigate("/admin/ventas")}>
                    Volver
                </button>
            </div>
        );
    }

    if (!venta) {
        return (
            <div className="admin-page">
                <p className="admin-subtitulo">Cargando venta...</p>
            </div>
        );
    }

    const ticketUrl = urlUpload(venta.url_comprobante);

    return (
        <div className="admin-page venta-page">
            <div className="venta-header">
                <div>
                    <h1 className="venta-title">VENTA #{venta.id}</h1>
                    <p className="venta-subtitle">{formatearFecha(venta.fecha_hora)}</p>
                </div>
                <div className="venta-header-actions">
                    <button className="tactile-btn volver-btn" onClick={() => navigate("/admin/ventas")}>
                        <ArrowLeft size={18} />
                        Volver
                    </button>
                    {venta.estado !== "CANCELADA" && (
                        <button
                            className="tactile-btn admin-btn-danger"
                            onClick={async () => {
                                if (!window.confirm("¿Cancelar esta venta? Esta acción restaurará el stock.")) return;
                                try {
                                    const res = await cancelarVenta(venta.id);
                                    setVenta(res.venta || res);
                                    alert("Venta cancelada.");
                                } catch (e) {
                                    alert(e.message || "Error al cancelar la venta.");
                                }
                            }}
                        >
                            <XCircle size={18} />
                            Cancelar venta
                        </button>                    )}
                </div>
            </div>

            <div className="venta-content">
                <aside className="venta-card">
                    <div className="venta-info">
                        <div className="venta-row"><span>Total</span><strong>${Number((venta.detalles || []).reduce((sum, d) => sum + ((d.precio_unitario_capturado || d.precio || 0) * (d.cantidad || 0)), 0)).toFixed(2)}</strong></div>
                        <div className="venta-row"><span>Método</span><strong>{venta.metodo_pago}</strong></div>
                        <div className="venta-row"><span>Estado</span><strong className={`state-${(venta.estado||'').toLowerCase()}`}>{venta.estado}</strong></div>
                        <div className="venta-row"><span>Cajero</span><strong>{venta.cajero_nombre || "Sin registro"}</strong></div>
                        <div className="venta-row"><span>Dispositivo</span><strong>{venta.dispositivo_modelo || "Sin registro"}</strong></div>
                        <div className="venta-row"><span>IP de origen</span><strong>{venta.ip_origen || "Sin registro"}</strong></div>
                        {venta.referencia && <div className="venta-row"><span>Referencia</span><strong>{venta.referencia}</strong></div>}
                        {venta.metodo_pago === "EFECTIVO" && (
                            <>
                                <div className="venta-row"><span>Recibido</span><strong>${Number(venta.monto_recibido).toFixed(2)}</strong></div>
                                <div className="venta-row"><span>Cambio</span><strong>${Number(venta.cambio_entregado).toFixed(2)}</strong></div>
                            </>
                        )}
                    </div>

                    <h2 className="admin-detalle-subtitulo">Productos</h2>
                    <div className="venta-products">
                        {(venta.detalles || []).map((d) => (
                            <div key={d.id} className="product-card">
                                <div className="product-info">
                                    <div className="product-name">{d.producto?.nombre || "Producto"}</div>
                                    <div className="product-meta">{d.cantidad} × ${Number(d.precio_unitario_capturado).toFixed(2)}</div>
                                </div>
                                <div className="product-price">${(d.cantidad * d.precio_unitario_capturado).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </aside>

                {ticketUrl && (
                    <section className="venta-right">
                        <div className="ticket-panel">
                            <h3>Ticket de terminal</h3>
                            <img src={ticketUrl} alt="Ticket de tarjeta" className="admin-ticket-preview" />
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default AdminVentaDetalle;
