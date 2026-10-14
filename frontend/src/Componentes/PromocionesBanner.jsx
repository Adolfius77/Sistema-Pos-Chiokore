import { CalendarDays, Tag } from 'lucide-react';
import { urlUpload } from '../config/env.js';

//metodo para escribir la fecha sin que el huso horario la corra un dia
const formatearFecha = (iso) => {
    if (!iso) return null;
    const [anio, mes, dia] = String(iso).split("-").map(Number);
    if (!anio || !mes || !dia) return null;
    return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
    });
};

const PromocionesBanner = ({ promociones }) => {
    if (!promociones || promociones.length === 0) return null;

    return (
        <div className="promo-banner-grid">
            {promociones.map((promo) => {
                const piezas = Number(promo.cantidadPaquete);
                const precio = Number(promo.precioPaquete);
                const hayPaquete = piezas > 1 && precio > 0;
                const vigencia = formatearFecha(promo.fechaFin);

                return (
                    <article key={promo.id} className="promo-card-moderno">
                        <div className="promo-card-img">
                            {promo.url_imagen ? (
                                <img src={urlUpload(promo.url_imagen)} alt={promo.nombre} />
                            ) : (
                                <div className="promo-card-placeholder">
                                    <Tag size={48} />
                                </div>
                            )}
                            <span className="promo-card-categoria">
                                {promo.categoria?.nombre || "General"}
                            </span>
                        </div>

                        <div className="promo-card-body">
                            <h3 className="promo-card-nombre">{promo.nombre}</h3>

                            {hayPaquete && (
                                <div className="promo-card-paquete">
                                    <span className="promo-paquete-label">Llévate {piezas} por</span>
                                    <span className="promo-paquete-valor">${precio.toFixed(2)}</span>
                                    <span className="promo-paquete-unitario">
                                        te sale en ${(precio / piezas).toFixed(2)} cada una
                                    </span>
                                </div>
                            )}

                            {vigencia && (
                                <p className="promo-card-vigencia">
                                    <CalendarDays size={16} />
                                    <span>Válida hasta el {vigencia}</span>
                                </p>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

export default PromocionesBanner;
