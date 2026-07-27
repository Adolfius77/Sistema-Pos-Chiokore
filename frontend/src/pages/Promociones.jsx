import React, { useState, useEffect } from 'react';
import apiCliente from '../config/api';
import PromocionesBanner from '../Componentes/PromocionesBanner';

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

    if (loading) {
        return <div className="promociones-loading">Cargando...</div>;
    }

    return (
        <div className="promociones-container">
            <h1 className="promociones-title">OFERTAS ESPECIALES</h1>
            <PromocionesBanner promociones={promociones} />
        </div>
    );
};

export default Promociones;
