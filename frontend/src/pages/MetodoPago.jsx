import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart.js";

const MetodoPago = () => {
    const navigate = useNavigate();
    const { getTotal, cartItems } = useCart();
    const carritoVacio = cartItems.length === 0;

    useEffect(() => {
        if (carritoVacio) {
            navigate("/carrito", { replace: true });
        }
    }, [carritoVacio, navigate]);

    return (
        <div className="layout-pago">
            <main className="pago-container">
                <div className="pago-card">
                    <h1>MÉTODO DE PAGO</h1>

                    <div className="total-box">
                        <span className="total-label">TOTAL A PAGAR</span>
                        <span className="total-monto">${getTotal().toFixed(2)}</span>
                    </div>

                    <div className="opciones-pago">
                        <button
                            className="btn-metodo"
                            disabled={carritoVacio}
                            onClick={() => navigate('/checkout/efectivo')}
                        >

                            <img
                                src="/dinero.png"
                                alt="Efectivo"
                                className="icono-pago"
                            />
                            <span>EFECTIVO</span>
                            <p>Pida el efectivo y dé el cambio</p>
                        </button>

                        <button
                            className="btn-metodo"
                            disabled={carritoVacio}
                            onClick={() => navigate('/checkout/tarjeta')}
                        >
                            <img
                                src="/tarjeta-de-credito.png"
                                alt="Efectivo"
                                className="icono-pago"
                            />
                            <span>TARJETA</span>
                            <p>Saque la terminal y pida la tarjeta</p>
                        </button>
                    </div>

                    <button className="btn-cancelar" onClick={() => navigate('/carrito')}>
                        CANCELAR COMPRA
                    </button>
                </div>
            </main>
        </div>
    );
};

export default MetodoPago;