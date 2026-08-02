import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { descargarReporteVentasExcel, listarVentasPorFecha, obtenerResumenRango } from "../../services/ventasAdmin.js";

const hoyIso = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatearFechaHora = (fechaHora) => {
    if (!fechaHora) return "Sin fecha";
    try {
        const fecha = new Date(fechaHora);
        if (Number.isNaN(fecha.getTime())) return fechaHora;
        return new Intl.DateTimeFormat("es-MX", {
            dateStyle: "medium",
            timeStyle: "short",
            hour12: false,
        }).format(fecha);
    } catch {
        return fechaHora;
    }
};

const AdminVentas = () => {
    const navigate = useNavigate();
    const [desde, setDesde] = useState(hoyIso());
    const [hasta, setHasta] = useState(hoyIso());
    const [ventas, setVentas] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(true);
    const [descargando, setDescargando] = useState(false);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState({ field: 'fecha_hora', dir: 'desc' });

    useEffect(() => {
        setCargando(true);
        Promise.all([
            listarVentasPorFecha({ desde, hasta }),
            obtenerResumenRango(desde, hasta),
        ])
            .then(([ventasData, resumenData]) => {
                setVentas(ventasData);
                setResumen(resumenData);
                setError("");
            })
            .catch(() => setError("No se pudieron cargar las ventas o el resumen."))
            .finally(() => setCargando(false));
    }, [desde, hasta]);

    const exportarExcel = async () => {
        if (!desde || !hasta) {
            setError("Selecciona ambas fechas para generar el reporte.");
            return;
        }
        if (desde > hasta) {
            setError("La fecha 'desde' no puede ser mayor a 'hasta'.");
            return;
        }

        try {
            setDescargando(true);
            setError("");
            const { blob, filename } = await descargarReporteVentasExcel({ desde, hasta });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e) {
            setError(e.message || "No se pudo descargar el reporte en Excel.");
        } finally {
            setDescargando(false);
        }
    };

        // Filtrado y orden local para la tabla
        const filteredVentas = (ventas || []).filter(v => {
            if (!search) return true;
            const s = search.toLowerCase();
            return String(v.id).includes(s) || (v.cajero_nombre || "").toLowerCase().includes(s) || (v.referencia || "").toLowerCase().includes(s) || (v.metodo_pago || "").toLowerCase().includes(s);
        }).sort((a,b) => {
            const f = sortBy.field;
            const dir = sortBy.dir === 'asc' ? 1 : -1;
            if (!a[f] || !b[f]) return 0;
            if (f === 'fecha_hora') return (new Date(a[f]) - new Date(b[f])) * dir;
            if (typeof a[f] === 'number') return (a[f] - b[f]) * dir;
            return String(a[f]).localeCompare(String(b[f])) * dir;
        });

        return (
            <div className="admin-page report-page">
                {/* Top area: filtros a la izquierda, botón grande a la derecha */}
                <div className="report-top">
                    <div className="report-filters-row">
                        <div className="fecha-input">
                            <label>Desde</label>
                            <input id="desde-ventas" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
                        </div>
                        <div className="fecha-input">
                            <label>Hasta</label>
                            <input id="hasta-ventas" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                        </div>
                    </div>

                    <div className="report-download">
                        <button className="excel-btn" onClick={exportarExcel} disabled={descargando}>
                            {descargando ? 'Generando...' : '↓ Descargar Excel'}
                        </button>
                    </div>
                </div>

                {error && <p className="admin-error">{error}</p>}
                {cargando && <p className="admin-subtitulo">Cargando...</p>}

                {/* Cards */}
                {!cargando && resumen && (
                    <div className="report-cards">
                        <div className="report-card">
                            <div className="card-title">VENTAS</div>
                            <div className="card-value">{resumen.numeroVentas}</div>
                        </div>
                        <div className="report-card report-card--accent">
                            <div className="card-title">TOTAL</div>
                            <div className="card-value">${Number(resumen.totalVentas ?? 0).toLocaleString('en-US', {minimumFractionDigits:2})}</div>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="report-list-wrap">
                    <div className="report-list-header">
                        <div>Folio / Fecha</div>
                        <div>Cajero</div>
                        <div>Dispositivo</div>
                        <div>Método</div>
                        <div className="text-right">Total</div>
                    </div>

                    <div className="report-list-body">
                        {filteredVentas.map((v) => (
                            <div key={v.id} className="report-row sale-header" onClick={() => navigate(`/admin/ventas/${v.id}`)}>
                                <div className="cell folio">
                                    <div className="folio-id">V-{v.id}</div>
                                    <div className="folio-fecha">{formatearFechaHora(v.fecha_hora)}</div>
                                    <div className="product-summary">
                                        {(v.detalles || []).map((d, idx) => (
                                            <span key={idx} className="product-summary-item">{d.producto?.nombre || 'Producto'} × {d.cantidad}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="cell">{v.cajero_nombre || '—'}</div>
                                <div className="cell">{v.dispositivo_modelo || '—'}</div>
                                <div className="cell">
                                    <span className={`method-badge method-${(v.metodo_pago||'').toLowerCase()}`}>{v.metodo_pago}</span>
                                </div>
                                <div className="cell text-right"><strong>${Number((v.detalles || []).reduce((sum, d) => sum + ((d.precio_unitario_capturado || d.precio || 0) * (d.cantidad || 0)), 0)).toLocaleString('en-US', {minimumFractionDigits:2})}</strong></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
};

export default AdminVentas;
