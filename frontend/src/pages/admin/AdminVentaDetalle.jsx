import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerVentaDetalle } from "../../services/ventasAdmin.js";
import { urlUpload } from "../../config/env.js";

const formatearFecha = (fechaHora) => {
    if (!fechaHora) return "—";
    try {
        return new Date(fechaHora).toLocaleString("es-MX");
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
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-titulo">VENTA #{venta.id}</h1>
                    <p className="admin-subtitulo">{formatearFecha(venta.fecha_hora)}</p>
                </div>
                <button className="tactile-btn admin-btn-secondary" onClick={() => navigate("/admin/ventas")}>
                    Volver
                </button>
            </div>

            <div className="admin-detalle-grid">
                <div className="admin-form-panel">
                    <div className="admin-detalle-fila">
                        <span>Total</span>
                        <strong>${Number(venta.total).toFixed(2)}</strong>
                    </div>
                    <div className="admin-detalle-fila">
                        <span>Método</span>
                        <strong>{venta.metodo_pago}</strong>
                    </div>
                    <div className="admin-detalle-fila">
                        <span>Estado</span>
                        <strong>{venta.estado}</strong>
                    </div>
                    {venta.referencia && (
                        <div className="admin-detalle-fila">
                            <span>Referencia</span>
                            <strong>{venta.referencia}</strong>
                        </div>
                    )}
                    {venta.metodo_pago === "EFECTIVO" && (
                        <>
                            <div className="admin-detalle-fila">
                                <span>Recibido</span>
                                <strong>${Number(venta.monto_recibido).toFixed(2)}</strong>
                            </div>
                            <div className="admin-detalle-fila">
                                <span>Cambio</span>
                                <strong>${Number(venta.cambio_entregado).toFixed(2)}</strong>
                            </div>
                        </>
                    )}

                    <h2 className="admin-detalle-subtitulo">Productos</h2>
                    <div className="admin-lista">
                        {(venta.detalles || []).map((d) => (
                            <div key={d.id} className="admin-lista-item compacto">
                                <div className="admin-lista-info">
                                    <h2>{d.producto?.nombre || "Producto"}</h2>
                                    <p>
                                        {d.cantidad} × ${Number(d.precio_unitario_capturado).toFixed(2)}
                                    </p>
                                </div>
                                <strong>
                                    ${(d.cantidad * d.precio_unitario_capturado).toFixed(2)}
                                </strong>
                            </div>
                        ))}
                    </div>
                </div>

                {ticketUrl && (
                    <div className="admin-form-panel">
                        <h2 className="admin-detalle-subtitulo">Ticket de terminal</h2>
                        <img src={ticketUrl} alt="Ticket de tarjeta" className="admin-ticket-preview" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminVentaDetalle;
