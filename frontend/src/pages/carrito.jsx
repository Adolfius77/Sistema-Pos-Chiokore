import { useNavigate } from 'react-router-dom';
import { useCart } from "../context/useCart.js";
import { urlUpload } from "../config/env.js";

const Carrito = () => {
    const { cartItems, updateQuantity, getTotal,eliminarCarrito  } = useCart();
    const navigate = useNavigate();
    return (
        <div className="layout-carrito">
            <main className="carrito-container">
                <h1>CARRITO</h1>

                <div className="carrito-items-list">
                    {cartItems.length === 0 ? (
                        <div className="carrito-vacio">
                            <p>Tu carrito está vacío.</p>
                            <button onClick={() => navigate('/categorias')}>Ir a categorías</button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div className="carrito-item-card" key={item.id}>
                                <img
                                    src={urlUpload(item.url_imagen) || "https://placehold.co/200x200/eeeeee/666666?text=Sin+Foto"}
                                    alt={item.nombre}
                                    className="item-img"
                                />

                                <div className="item-info">
                                    <span className="item-nombre">{item.nombre}</span>
                                    <span className="item-precio">${item.precio.toFixed(2)}</span>
                                </div>

                                <div className="item-controles">
                                    <button onClick={() => updateQuantity(item.id, item.cantidad - 1)}>-</button>
                                    <input type="text" value={item.cantidad} readOnly />
                                    <button onClick={() => updateQuantity(item.id, item.cantidad + 1)}>+</button>
                                </div>

                                <div className="item-subtotal">
                                    ${(item.precio * item.cantidad).toFixed(2)}
                                </div>
                                <div className="btn-borrar">
                                    <button onClick={() => eliminarCarrito(item.id)}>Borrar</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="carrito-resumen">
                    <div className="total-box">
                        <span className="total-label">TOTAL A PAGAR</span>
                        <span className="total-monto">${getTotal().toFixed(2)}</span>
                    </div>

                    <button
                        className="btn-proceder-pago"
                        disabled={cartItems.length === 0}
                        onClick={() => navigate('/metodopago')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                            <circle cx="12" cy="12" r="2"></circle>
                            <path d="M6 12h.01M18 12h.01"></path>
                        </svg>
                        PROCEDER AL PAGO
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Carrito;