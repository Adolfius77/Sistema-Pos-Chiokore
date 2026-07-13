import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCliente from '../config/api';

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
                                <img src={cat.url_imagen || '/camisa.png'} alt={cat.nombre} />
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