import React, { useState, useEffect }from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiCliente from "../config/api.js";
import BotonAgregar from '../Componentes/BotonAgregar';

const Catalogo = () =>{
    const {id } = useParams();
    const navigate = useNavigate();

    const [productos,setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const[error, setError] = useState(null);

    useEffect(() =>{
        const obtenerProductos = async () =>{
            try{
                const respuesta = await apiCliente.get(`/productos/categoria/${id}`);
                console.log("productos recibidos: " ,respuesta.data);
                setProductos(respuesta.data);
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
        <div className="msj-cargando">
            <h2>Cargando inventario... </h2>
        </div>
    );
    if (error) return (
        <div className="error-server">
            <h2>Hubo un problema de conexión con el servidor </h2>
            <p>{error}</p>
            <button onClick={() => navigate('/categorias')}>Volver</button>
        </div>
    );
    return (
        <div className="catalogo-container">
            <div className="catalogo-header">
                <h2 className="name">PRODUCTOS DISPONIBLES</h2>
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
                                <img src={prod.url_imagen || "https://placehold.co/200x200/eeeeee/666666?text=Sin+Foto"} alt={prod.nombre} />                            </div>
                            <div className="info-producto">
                                <h4>{prod.nombre}</h4>
                                <span className="precio">${prod.precio} MXN</span>
                                <p className="stock">
                                    {prod.stock > 0 ? `Stock: ${prod.stock} piezas` : 'Agotado'}
                                </p>
                               <BotonAgregar
                                   producto={prod}

                                   />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Catalogo;