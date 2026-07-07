import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCliente from "../config/api.js";

const Categorias = () => {
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const obtenerCategorias = useCallback(async () => {
        try {
            const respuesta = await apiCliente.get("/categorias");
            setCategorias(respuesta.data);
        } catch (fetchError) {
            console.error("Error al cargar categorías:", fetchError);
            setError("No se pudo cargar el catálogo de categorías.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        void obtenerCategorias();
    }, [obtenerCategorias]);

    const seleccionarCategoria = (id, nombre) => {
        navigate(`/catalogo/${id}`, { state: { nombreCategoria: nombre } });
    };

    if (cargando) {
        return <h2 style={{ padding: '2rem', textAlign: 'center' }}>Cargando categorías...</h2>;
    }

    if (error) {
        return (
            <div className="error-server">
                <h2>Hubo un problema al cargar categorías</h2>
                <p>{error}</p>
                <button
                    onClick={() => {
                        setCargando(true);
                        setError("");
                        void obtenerCategorias();
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="categorias-container">
            <h2 className="titulo-seccion">SELECCIONA UNA CATEGORIA</h2>

            <div className="categorias-grid">
                {categorias.length === 0 && <p>No hay categorías registradas.</p>}
                {categorias.map((cat) => (
                    <div key={cat.id} className="categoria-card" onClick={() => seleccionarCategoria(cat.id, cat.nombre)}>
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