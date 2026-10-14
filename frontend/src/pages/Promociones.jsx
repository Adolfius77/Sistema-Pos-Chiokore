import { useState, useEffect } from 'react';
import apiCliente from '../config/api';
import PromocionesBanner from '../Componentes/PromocionesBanner';

const Promociones = () => {
    const [promociones, setPromociones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiCliente.get("/promociones/vigentes")
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
            {promociones.length === 0 ? (
                <p className="promociones-vacio">No hay ofertas vigentes por ahora.</p>
            ) : (
                <PromocionesBanner promociones={promociones} />
            )}
        </div>
    );
};

export default Promociones;
