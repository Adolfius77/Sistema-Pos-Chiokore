import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, XCircle, CheckCircle2, Banknote, CreditCard, User, Smartphone, Globe, Hash } from "lucide-react";
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
    const cancelada = venta.estado === "CANCELADA";
    const esEfectivo = venta.metodo_pago === "EFECTIVO";


    const total = (venta.detalles || []).reduce(
        (suma, d) => suma + ((d.precio_unitario_capturado || d.precio || 0) * (d.cantidad || 0)),
        0
    );
    const dinero = (n) =>
        `$${Number(n ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const trazabilidad = [
        { icono: User, etiqueta: "Cajero", valor: venta.cajero_nombre },
        { icono: Smartphone, etiqueta: "Dispositivo", valor: venta.dispositivo_modelo },
        { icono: Globe, etiqueta: "IP de origen", valor: venta.ip_origen },
    ];

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
                    {!cancelada && (
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
                        </button>
                    )}
                </div>
            </div>

            {cancelada && (
                <div className="venta-aviso-cancelada">
                    <XCircle size={20} />
                    <span>Esta venta fue cancelada. El stock de sus productos ya fue restaurado.</span>
                </div>
            )}

            <div className="venta-content">
                <aside className="venta-card">
                    <div className={`venta-total${cancelada ? " venta-total--cancelada" : ""}`}>
                        <span className="venta-total-label">Total de la venta</span>
                        <strong className="venta-total-valor">{dinero(total)}</strong>
                        <span className={`estado-badge estado-badge--${cancelada ? "cancelada" : "completada"}`}>
                            {cancelada ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                            {venta.estado}
                        </span>
                    </div>

                    <div className="venta-bloque">
                        <h2 className="venta-bloque-titulo">Cobro</h2>
                        <div className="venta-info">
                            <div className="venta-row">
                                <span>Metodo</span>
                                <strong className={`method-badge method-${(venta.metodo_pago || "").toLowerCase()}`}>
                                    {esEfectivo ? <Banknote size={16} /> : <CreditCard size={16} />}
                                    {venta.metodo_pago}
                                </strong>
                            </div>
                            {esEfectivo && (
                                <>
                                    <div className="venta-row"><span>Recibido</span><strong>{dinero(venta.monto_recibido)}</strong></div>
                                    <div className="venta-row"><span>Cambio</span><strong>{dinero(venta.cambio_entregado)}</strong></div>
                                </>
                            )}
                            {venta.referencia && (
                                <div className="venta-row">
                                    <span>Referencia</span>
                                    <strong className="venta-referencia"><Hash size={15} />{venta.referencia}</strong>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="venta-bloque">
                        <h2 className="venta-bloque-titulo">Trazabilidad</h2>
                        <div className="venta-info">
                            {trazabilidad.map(({ icono: Icono, etiqueta, valor }) => (
                                <div key={etiqueta} className="venta-row">
                                    <span><Icono size={16} />{etiqueta}</span>
                                    <strong className={valor ? "" : "venta-sin-dato"}>{valor || "Sin registro"}</strong>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="venta-bloque">
                        <h2 className="venta-bloque-titulo">
                            Productos <span className="venta-conteo">{(venta.detalles || []).length}</span>
                        </h2>
                        <div className="venta-products">
                            {(venta.detalles || []).map((d) => (
                                <div key={d.id} className="product-card">
                                    <div className="product-info">
                                        <div className="product-name">{d.producto?.nombre || "Producto"}</div>
                                        <div className="product-meta">{d.cantidad} x {dinero(d.precio_unitario_capturado)}</div>
                                    </div>
                                    <div className="product-price">{dinero(d.cantidad * d.precio_unitario_capturado)}</div>
                                </div>
                            ))}
                        </div>
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
