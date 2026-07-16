import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const Promociones = () => {
    const [promociones, setPromociones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/promociones/activas`)
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
            <h1 className="promociones-title">PROMOCIONES ACTIVAS</h1>

            <div className="promociones-grid">
                {promociones.map((promo) => (
                    <div key={promo.id} className="promo-card">
                        <div className="promo-body">
                            <Tag className="promo-icon" size={32} />
                            <span className="promo-descuento">{promo.descuento}</span>
                            <span className="promo-nombre">{promo.nombre}</span>
                            <span className="promo-fecha">{formatearFecha(promo.fechaFin)}</span>
                        </div>
                        <div className="promo-base">
                            <span className="promo-aplica">CATEGORÍA ID: {promo.categoriaId}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Promociones;