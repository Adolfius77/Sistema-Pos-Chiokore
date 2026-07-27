import { Tag, Calendar } from 'lucide-react';
import { urlUpload } from '../config/env.js';

const PromocionesBanner = ({ promociones }) => {
    if (!promociones || promociones.length === 0) return null;

    return (
        <div className="promo-banner-grid">
            {promociones.map((promo) => (
                <div key={promo.id} className="promo-card-moderno">
                    <div className="promo-card-img">
                        {promo.url_imagen ? (
                            <img src={urlUpload(promo.url_imagen)} alt={promo.nombre} />
                        ) : (
                            <div className="promo-card-placeholder">
                                <Tag size={48} />
                            </div>
                        )}
                        <div className="promo-badge-descuento">
                            <span className="promo-badge-num">{promo.descuento}%</span>
                            <span className="promo-badge-txt">OFF</span>
                        </div>
                    </div>

                    <div className="promo-card-body">
                        <h3 className="promo-card-nombre">{promo.nombre}</h3>
                        
                        <div className="promo-card-paquete">
                            <span className="promo-paquete-label">Paquete</span>
                            <span className="promo-paquete-valor">{promo.cantidadPaquete} × ${Number(promo.precioPaquete).toFixed(2)}</span>
                        </div>

                        <div className="promo-card-categoria">
                            <Tag size={16} />
                            <span>{promo.categoria?.nombre || "General"}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PromocionesBanner;
