import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import { procesarCobro } from "../services/ventas.js";
import { DEFAULT_USUARIO_ID } from "../config/env.js";

const CheckoutTarjeta = () => {
    const navigate = useNavigate();
    const { cartItems, getTotal, clearCart } = useCart();
    const [titular, setTitular] = useState("");
    const [ultimos4, setUltimos4] = useState("");
    const [referencia, setReferencia] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");
    const [okMessage, setOkMessage] = useState("");

    const total = getTotal();
    const carritoVacio = cartItems.length === 0;
    const titularValido = titular.trim().length >= 3;
    const tarjetaValida = /^\d{4}$/.test(ultimos4);
    const formValido = titularValido && tarjetaValida && !carritoVacio && total > 0;

    const enviarPago = async (event) => {
        event.preventDefault();
        if (!formValido) return;

        try {
            setProcesando(true);
            setError("");
            await procesarCobro({
                usuarioId: DEFAULT_USUARIO_ID,
                metodoPago: "TARJETA",
                montoRecibido: total,
                items: cartItems
            });
            clearCart();
            setOkMessage(`Pago aprobado (${referencia || `****${ultimos4}`}).`);
        } catch (errorCobro) {
            setError(errorCobro.message);
        } finally {
            setProcesando(false);
        }
    };

    if (carritoVacio && !okMessage) {
        return (
            <div className="error-server">
                <h2>No hay productos para cobrar</h2>
                <button onClick={() => navigate("/categorias")}>Regresar a categorías</button>
            </div>
        );
    }

    return (
        <div className="layout-tarjeta">
            <main className="tarjeta-card">
                <h1>COBRO CON TARJETA</h1>
                <p className="monto-total">Total: ${total.toFixed(2)}</p>

                {okMessage ? (
                    <div className="venta-ok">
                        <p>{okMessage}</p>
                        <button onClick={() => navigate("/categorias")}>Nueva venta</button>
                    </div>
                ) : (
                    <form className="tarjeta-form" onSubmit={enviarPago}>
                        <label htmlFor="titular">Nombre del titular</label>
                        <input
                            id="titular"
                            type="text"
                            value={titular}
                            onChange={(event) => setTitular(event.target.value)}
                            placeholder="Ej. Juan Pérez"
                        />

                        <label htmlFor="ultimos4">Últimos 4 dígitos</label>
                        <input
                            id="ultimos4"
                            type="text"
                            maxLength={4}
                            value={ultimos4}
                            onChange={(event) => setUltimos4(event.target.value.replace(/\D/g, ""))}
                            placeholder="1234"
                        />

                        <label htmlFor="referencia">Referencia (opcional)</label>
                        <input
                            id="referencia"
                            type="text"
                            value={referencia}
                            onChange={(event) => setReferencia(event.target.value)}
                            placeholder="Folio de terminal"
                        />

                        {error && <p className="error-text">{error}</p>}

                        <div className="acciones-cobro">
                            <button type="button" className="btn-secundario" onClick={() => navigate("/metodopago")}>
                                Volver
                            </button>
                            <button type="submit" className="btn-cobrar" disabled={!formValido || procesando}>
                                {procesando ? "Procesando..." : "Confirmar pago"}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
};

export default CheckoutTarjeta;
