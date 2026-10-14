import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiCliente from "../config/api.js";
import BotonAgregar from "../Componentes/botonAgregar.jsx";
import { RiArrowGoBackLine } from "react-icons/ri";
import { urlUpload } from "../config/env.js";

// El color de la etiqueta de stock comunica el nivel: antes todo se
// pintaba de rojo, incluso con el inventario lleno.
const nivelStock = (stock) => {
    if (stock <= 0) return "stock--agotado";
    if (stock <= 5) return "stock--bajo";
    return "stock--ok";
};

const Catalogo = () =>{
    const {id } = useParams();
    const navigate = useNavigate();

    const [productos,setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const[error, setError] = useState(null);

    const obtenerProductos = useCallback(async () =>{
        try{
            const respuesta = await apiCliente.get(`/productos/categoria/${id}/con-promo`);
            setProductos(respuesta.data);
        }catch (err){
            console.error("error en el fetch:", err);
            setError("No se pudieron cargar los productos.");
        } finally {
            setCargando(false);
        }
    }, [id]);

    useEffect(() =>{
        void obtenerProductos();
    }, [obtenerProductos]);
    if (cargando) return (
        <div className="msj-cargando">
            <h2>Cargando inventario... </h2>
        </div>
    );
    if (error) return (
        <div className="error-server">
            <h2>Hubo un problema de conexión con el servidor </h2>
            <p>{error}</p>
            <div className="error-actions">
                <button
                    onClick={() => {
                        setCargando(true);
                        setError(null);
                        void obtenerProductos();
                    }}
                >
                    Reintentar
                </button>
                <button onClick={() => navigate('/categorias')}>Volver</button>
            </div>
        </div>
    );
    return (
        <div className="catalogo-container">
            <button className="btn-volver" onClick={() => navigate('/categorias')}>
                <RiArrowGoBackLine size={32} />
                <span>Volver</span>
            </button>
            <div className="catalogo-header">
                <h2 className="name">PRODUCTOS DISPONIBLES</h2>
            </div>
            {productos.length === 0 ? (
                <div className="sin-productos">
                    <p>No hay productos registrados en esta categoría.</p>
                </div>
            ) : (
                <div className="productos-grid">
                    {productos.map((prod) => {
                        // La pieza suelta siempre vale el precio de lista: el descuento
                        // aparece hasta que el cliente completa el paquete.
                        const precioBase = Number(prod.precioOriginal ?? prod.precioFinal ?? 0);
                        const esPromoPaquete = prod.tienePromo
                            && Number(prod.cantidadPaquete) > 1
                            && Number(prod.precioPaquete) > 0;

                        return (
                            <div key={prod.id} className="producto-card">
                                <div className="img-container">
                                    <img src={urlUpload(prod.url_imagen) || "https://placehold.co/200x200/eeeeee/666666?text=Sin+Foto"} alt={prod.nombre} />
                                    <div className="etiqueta-precio">
                                        <span>${precioBase.toFixed(2)}</span>
                                        <span>MXN</span>
                                    </div>
                                    {esPromoPaquete && (
                                        <div className="badge-promo badge-promo--paquete">PAQUETE</div>
                                    )}
                                </div>

                                <div className="info-producto">
                                    <h4>{prod.nombre}</h4>
                                    {esPromoPaquete && (
                                        <p className="promo-paquete-info">
                                            Llévate {prod.cantidadPaquete} por ${Number(prod.precioPaquete).toFixed(2)}
                                        </p>
                                    )}
                                    <p className={`stock ${nivelStock(prod.stock)}`}>
                                        {prod.stock > 0 ? `${prod.stock} en existencia` : "Agotado"}
                                    </p>
                                    <BotonAgregar producto={{ ...prod, precio: precioBase }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Catalogo;
