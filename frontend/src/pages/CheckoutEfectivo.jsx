import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import { procesarCobro } from "../services/ventas.js";
import { CheckCircle } from "lucide-react";
import { sound } from "../utils/sound.js";

const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

const CheckoutEfectivo = () => {
    const navigate = useNavigate();
    const { cartItems, getTotal, clearCart } = useCart();
    const [montoInput, setMontoInput] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");

    const [ventaExitosa, setVentaExitosa] = useState(null);

    const total = getTotal();
    const montoRecibido = Number.parseFloat(montoInput || "0");
    const montoValido = Number.isFinite(montoRecibido) ? montoRecibido : 0;

    const cambio = useMemo(() => Math.max(montoValido - total, 0), [montoValido, total]);
    const faltante = useMemo(() => Math.max(total - montoValido, 0), [montoValido, total]);
    const puedeCobrar = cartItems.length > 0 && montoValido >= total && total > 0;

    const insertarTecla = (tecla) => {
        sound.playClick();
        if (tecla === "." && montoInput.includes(".")) return;
        setMontoInput((prev) => `${prev}${tecla}`);
    };

    const borrarUltimo = () => {
        sound.playClick();
        setMontoInput((prev) => prev.slice(0, -1));
    };

    const limpiar = () => {
        sound.playClick();
        setMontoInput("");
    };

    const cobrar = async () => {
        if (!puedeCobrar) return;

        try {
            setProcesando(true);
            setError("");

            const venta = await procesarCobro({
                metodoPago: "EFECTIVO",
                montoRecibido: montoValido,
                items: cartItems.map(item => ({
                    producto_id: item.id,
                    cantidad: item.cantidad,
                    precio: item.precio
                }))
            });

            setVentaExitosa({
                folio: venta.id || venta.venta?.id || "N/A",
                totalPagado: total,
                efectivoRecibido: montoValido,
                cambioEntregado: cambio
            });

            sound.playSuccess();
            clearCart();
            setMontoInput("");
        } catch (errorCobro) {
            setError(errorCobro.message || "Error al procesar el pago");
        } finally {
            setProcesando(false);
        }
    };

    if (cartItems.length === 0 && !ventaExitosa) {
        return (
            <div className="error-server">
                <h2>No hay productos para cobrar</h2>
                <button onClick={() => navigate("/categorias")}>Regresar a categorías</button>
            </div>
        );
    }

    if (ventaExitosa) {
        return (
            <div className="layout-efectivo">
                <main className="pantalla-exito">
                    <div className="exito-card">

                        <div className="icono-exito">
                            <CheckCircle size={100} strokeWidth={2} color="#10b981" />
                        </div>

                        <h1>¡VENTA EXITOSA!</h1>

                        <div className="exito-detalles">
                            <div className="fila-detalle">
                                <span>Total pagado:</span>
                                <strong>${ventaExitosa.totalPagado.toFixed(2)}</strong>
                            </div>
                            <div className="fila-detalle">
                                <span>Efectivo recibido:</span>
                                <strong>${ventaExitosa.efectivoRecibido.toFixed(2)}</strong>
                            </div>
                            <hr className="separador" />
                            <div className="fila-detalle cambio-resaltado">
                                <span>Cambio a entregar:</span>
                                <strong>${ventaExitosa.cambioEntregado.toFixed(2)}</strong>
                            </div>
                        </div>

                        <p className="folio-texto">Folio de venta: #{ventaExitosa.folio}</p>

                        <button className="btn-nueva-venta" onClick={() => {
                            setVentaExitosa(null);
                            navigate("/categorias");
                        }}>
                            NUEVA VENTA
                        </button>
                    </div>
                </main>
            </div>
        );
    }


    return (
        <div className="layout-efectivo">
            <main className="efectivo-container">
                <div className="panel-resumen">
                    <div className="efectivo-card">
                        <h1>PAGO EN EFECTIVO</h1>
                        <p>Ingrese el monto recibido del cliente.</p>
                    </div>
                    <div className="efectivo-recibido">
                        <h1>EFECTIVO RECIBIDO</h1>
                        <span className="monto-recibido">${montoValido.toFixed(2)}</span>
                    </div>
                    <div className="total-pagar">
                        <h1>TOTAL A PAGAR</h1>
                        <span className="total-monto">${total.toFixed(2)}</span>
                        {faltante > 0 && <p className="faltante">Faltan ${faltante.toFixed(2)}</p>}
                        {cambio > 0 && <p className="cambio">Cambio ${cambio.toFixed(2)}</p>}
                    </div>
                    {error && <p className="error-text">{error}</p>}
                </div>

                <div className="panel-teclado">
                    <h2>TECLADO NUMÉRICO</h2>
                    <div className="input-monto">
                        <label htmlFor="monto-recibido">Monto recibido</label>
                        <input
                            id="monto-recibido"
                            type="number"
                            min="0"
                            step="0.01"
                            value={montoInput}
                            onChange={(event) => setMontoInput(event.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="teclado-grid">
                        {teclas.map((tecla) => (
                            <button key={tecla} type="button" onClick={() => insertarTecla(tecla)}>
                                {tecla}
                            </button>
                        ))}
                        <button type="button" onClick={borrarUltimo}>⌫</button>
                        <button type="button" onClick={limpiar}>C</button>
                    </div>
                    <div className="acciones-cobro">
                        <button className="btn-secundario" onClick={() => navigate("/metodopago")}>
                            Volver
                        </button>
                        <button className="btn-cobrar" disabled={!puedeCobrar || procesando} onClick={cobrar}>
                            {procesando ? "Procesando..." : "Cobrar"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutEfectivo;