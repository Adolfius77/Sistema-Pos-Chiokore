import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarVentasPorFecha } from "../../services/ventasAdmin.js";

const hoyIso = () => new Date().toISOString().slice(0, 10);

const formatearHora = (fechaHora) => {
    if (!fechaHora) return "—";
    try {
        return new Date(fechaHora).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return fechaHora;
    }
};

const AdminVentas = () => {
    const navigate = useNavigate();
    const [fecha, setFecha] = useState(hoyIso());
    const [ventas, setVentas] = useState([]);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        setCargando(true);
        listarVentasPorFecha(fecha)
            .then((data) => {
                setVentas(data);
                setError("");
            })
            .catch(() => setError("No se pudieron cargar las ventas."))
            .finally(() => setCargando(false));
    }, [fecha]);

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-titulo">VENTAS</h1>
                    <p className="admin-subtitulo">Historial por fecha</p>
                </div>
                <div className="admin-filtro-fecha">
                    <label htmlFor="fecha-ventas">Fecha</label>
                    <input
                        id="fecha-ventas"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>
            </div>

            {error && <p className="admin-error">{error}</p>}
            {cargando && <p className="admin-subtitulo">Cargando...</p>}

            {!cargando && ventas.length === 0 && (
                <p className="admin-subtitulo">No hay ventas en esta fecha.</p>
            )}

            <div className="admin-lista">
                {ventas.map((v) => (
                    <button
                        key={v.id}
                        className="tactile-btn admin-lista-item admin-lista-clickable"
                        onClick={() => navigate(`/admin/ventas/${v.id}`)}
                    >
                        <div className="admin-lista-info">
                            <h2>Folio #{v.id}</h2>
                            <p>
                                {formatearHora(v.fecha_hora)} · {v.metodo_pago}
                                {v.referencia ? ` · Ref: ${v.referencia}` : ""}
                            </p>
                        </div>
                        <strong className="admin-lista-total">${Number(v.total).toFixed(2)}</strong>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminVentas;
