import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import apiCliente from '../config/api';
import { urlUpload } from '../config/env.js';

const Promociones = () => {
    const [promociones, setPromociones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiCliente.get("/promociones/activas")
            .then(response => {
                setPromociones(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al cargar las promociones:", error);
                setLoading(false);
            });
    }, []);

    const formatearFecha = (fechaString) => {
        if (!fechaString) return "";
        const opciones = { day: 'numeric', month: 'short' };
        const fecha = new Date(fechaString);
        return `VÁLIDO HASTA ${fecha.toLocaleDateString('es-ES', opciones).toUpperCase()}`;
    };

    if (loading) {
        return <div className="promociones-loading">Cargando...</div>;
    }

    return (
        <div className="promociones-container">
            <h1 className="promociones-title">OFERTAS ESPECIALES</h1>

            <div className="promociones-grid">
                {promociones.map((promo) => (
                    <div key={promo.id} className="promo-card">
                        {promo.url_imagen && (
                            <div className="promo-img">
                                <img src={urlUpload(promo.url_imagen)} alt={promo.nombre} />
                            </div>
                        )}
                        <div className="promo-body">
                            <Tag className="promo-icon" size={32} />
                            <span className="promo-descuento">{promo.descuento}%</span>
                            <span className="promo-nombre">{promo.nombre}</span>
                        </div>
                        <div className="promo-base">
                            <span className="promo-aplica">{promo.categoria?.nombre || "Sin categoría"}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Promociones;
