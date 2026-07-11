import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCliente from '../config/api';

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const respuesta = await apiCliente.get('/api/categorias');
                setCategorias(respuesta.data);
            } catch (error) {
                console.error("Error al cargar categorías:", error);
            }
        };
        cargarCategorias();
    }, []);

    
    const obtenerImagen = (nombre) => {
        const nombreLimpio = nombre.toLowerCase();
        if (nombreLimpio.includes('ropa')) return '/ropaA.png';
        if (nombreLimpio.includes('juguete')) return '/JuguetesA.png';
        if (nombreLimpio.includes('mueble')) return '/muebleA.png';
        if (nombreLimpio.includes('electro')) return '/electronicosA.png';
        return '/camisa.png';
    };

    return (
        <div className="layout-categorias">
            <h1 className="titulo-seccion">SELECCIONA UNA CATEGORIA</h1>

            <div className="categorias-grid">
                {categorias.map((cat) => (
                    <button
                        key={cat.id}
                        className="categoria-card"
                        onClick={() => navigate(`/catalogo/${cat.id}`)}
                    >
                        <div className="img-container">
                            <img src={obtenerImagen(cat.nombre)} alt={cat.nombre} />
                        </div>
                        <div className="label-container">
                            <h2>{cat.nombre.toUpperCase()}</h2>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Categorias;