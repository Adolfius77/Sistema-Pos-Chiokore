import React, { useState, useEffect }from "react";
import { useParams, useNavigate } from "react-router-dom";

const Catalogo = () =>{
    const {id } = useParams();
    const navigate = useNavigate();

    const [productos,setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const[error, setError] = useState(null);

    useEffect(() =>{
        const obtenerProductos = async () =>{
            try{
                const respuesta = await fetch(`http://localhost:8080/api/productos/categoria/${id}`);
                if(!respuesta.ok){
                    throw new Error("Error al cargar productos");
                }
                const datos = await respuesta.json();
                setProductos(datos);
                setCargando(false);
            }catch (err){
                console.error("error en el fetch:", err);
                setError("No se pudieron cargar los productos");
                setCargando(false);
            }
        };
        obtenerProductos();
    }, [id]);
    if (cargando) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Cargando inventario... </h2>
        </div>
    );
    if (error) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            <h2>Hubo un problema de conexión con el servidor </h2>
            <p>{error}</p>
            <button onClick={() => navigate('/categorias')}>Volver</button>
        </div>
    );
    return (
        <div className="catalogo-container">
            <div className="catalogo-header">
                <button className="btn-volver" onClick={() => navigate('/categorias')}>Volver</button>
                <h2>Productos disponibles</h2>
        </div>
            {productos.length === 0 ? (
                <div className="sin-productos">
                    <p>No hay productos registrados en esta categoría.</p>
                </div>
            ) : (
                <div className="productos-grid">
                    {productos.map((prod) => (
                        <div key={prod.id} className="producto-card">
                            <div className="img-producto">
                                <img src={prod.imagenUrl || "https://via.placeholder.com/200?text=Sin+Imagen"} alt={prod.nombre} />
                            </div>
                            <div className="info-producto">
                                <h4>{prod.nombre}</h4>
                                <span className="precio">${prod.precio} MXN</span>
                                <p style={{ fontSize: '0.85rem', color: prod.stock > 0 ? '#6c757d' : 'red' }}>
                                    {prod.stock > 0 ? `Stock: ${prod.stock} piezas` : 'Agotado'}
                                </p>
                                <button
                                    className="btn-agregar"
                                    disabled={prod.stock === 0}
                                    style={{ backgroundColor: prod.stock === 0 ? '#ccc' : '#0d6efd' }}
                                >
                                    {prod.stock === 0 ? 'Sin existencias' : 'Agregar al Carrito'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Catalogo;