import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCliente from '../config/api';
import { urlUpload } from '../config/env.js';

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const respuesta = await apiCliente.get('/categorias');
                setCategorias(respuesta.data);
                setError(null);
            } catch (error) {
                console.error("Error al cargar categorías:", error);
                setError("No se pudieron cargar las categorías. Verifica el servidor.");
            }
        };
        cargarCategorias();
    }, []);

    const obtenerImagenFallback = (nombre) => {
        const nombreLimpio = (nombre || '').toLowerCase();
        if (nombreLimpio.includes('ropa')) return '/ropaA.png';
        if (nombreLimpio.includes('juguete')) return '/JuguetesA.png';
        if (nombreLimpio.includes('mueble')) return '/muebleA.png';
        if (nombreLimpio.includes('electro')) return '/electronicosA.png';
        return '/camisa.png';
    };

    const obtenerImagen = (cat) => urlUpload(cat.url_imagen) || obtenerImagenFallback(cat.nombre);

    return (
        <div className="layout-categorias">
            <h1 className="titulo-seccion">SELECCIONA UNA CATEGORIA</h1>

            {error ? (
                <div style={{color: 'red', fontSize: '1.5rem', fontWeight: 'bold'}}>{error}</div>
            ) : (
                <div className="categorias-grid">
                    {categorias.map((cat) => (
                        <button
                            key={cat.id}
                            className="tactile-btn categoria-card"
                            onClick={() => navigate(`/catalogo/${cat.id}`)}
                        >
                            <div className="img-container">
                                <img src={obtenerImagen(cat)} alt={cat.nombre} />
                            </div>
                            <div className="label-container">
                                <h2>{cat.nombre.toUpperCase()}</h2>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Categorias;
