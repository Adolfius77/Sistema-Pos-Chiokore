import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Categorias = () => {
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerCategorias = async () => {
            try {
                const respuesta = await fetch('http://localhost:8080/api/categorias');
                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    setCategorias(datos);
                }
            } catch (error) {
                console.error("Error al cargar categorías:", error);
            } finally {
                setCargando(false);
            }
        };

        obtenerCategorias();
    }, []);

    const seleccionarCategoria = (id, nombre) => {
        navigate(`/catalogo/${id}`, { state: { nombreCategoria: nombre } });
    };

    if (cargando) {
        return <h2 style={{ padding: '2rem', textAlign: 'center' }}>Cargando categorías...</h2>;
    }

    return (
        <div className="categorias-container">
            <h2 className="titulo-seccion">SELECCIONA UNA CATEGORIA</h2>

            <div className="categorias-grid">
                {categorias.map((cat) => (
                    <div
                        key={cat.id}
                        className="categoria-card"
                        onClick={() => seleccionarCategoria(cat.id, cat.nombre)}
                    >
                        <div className="img-container">
                            <img src={cat.url_imagen || "https://via.placeholder.com/200?text=Categoria"} alt={cat.nombre} />
                        </div>
                        <div className="card-body">
                            <h3>{cat.nombre}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Categorias;