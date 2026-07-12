import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import { procesarCobroTarjeta } from "../services/ventas.js";
import { Camera, CheckCircle } from "lucide-react";

const CheckoutTarjeta = () => {
    const navigate = useNavigate();
    const { cartItems, getTotal, clearCart } = useCart();
    const inputFotoRef = useRef(null);

    const [ticketFile, setTicketFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [referencia, setReferencia] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");
    const [ventaExitosa, setVentaExitosa] = useState(null);

    const total = getTotal();
    const carritoVacio = cartItems.length === 0;
    const puedeCobrar = !carritoVacio && total > 0 && !!ticketFile;

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const seleccionarFoto = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Selecciona una imagen del ticket (JPG, PNG o WEBP).");
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setTicketFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError("");
    };

    const abrirSelector = () => inputFotoRef.current?.click();

    const cobrar = async () => {
        if (!puedeCobrar) return;

        try {
            setProcesando(true);
            setError("");

            const respuesta = await procesarCobroTarjeta({
                items: cartItems.map((item) => ({
                    producto_id: item.id,
                    cantidad: item.cantidad,
                    precio: item.precio,
                })),
                referencia,
                ticketFile,
                total,
            });

            setVentaExitosa({
                folio: respuesta.venta?.id || respuesta.id || "N/A",
                totalPagado: total,
                referencia: referencia.trim() || null,
            });

            clearCart();
            setTicketFile(null);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl("");
            setReferencia("");
        } catch (errorCobro) {
            setError(errorCobro.message || "Error al procesar el pago.");
        } finally {
            setProcesando(false);
        }
    };

    if (carritoVacio && !ventaExitosa) {
        return (
            <div className="error-server">
                <h2>No hay productos para cobrar</h2>
                <button onClick={() => navigate("/categorias")}>Regresar a categorías</button>
            </div>
        );
    }

    if (ventaExitosa) {
        return (
            <div className="layout-tarjeta">
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
                                <span>Método:</span>
                                <strong>Tarjeta</strong>
                            </div>
                            {ventaExitosa.referencia && (
                                <>
                                    <hr className="separador" />
                                    <div className="fila-detalle">
                                        <span>Referencia / folio:</span>
                                        <strong>{ventaExitosa.referencia}</strong>
                                    </div>
                                </>
                            )}
                        </div>

                        <p className="folio-texto">Folio de venta: #{ventaExitosa.folio}</p>

                        <button
                            className="btn-nueva-venta"
                            onClick={() => {
                                setVentaExitosa(null);
                                navigate("/categorias");
                            }}
                        >
                            NUEVA VENTA
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="layout-tarjeta">
            <main className="tarjeta-container">
                <div className="panel-resumen">
                    <div className="tarjeta-info-card">
                        <h1>COBRO CON TARJETA</h1>
                        <p>Cobre en la terminal y suba la foto del ticket.</p>
                    </div>
                    <div className="total-pagar">
                        <h1>TOTAL A PAGAR</h1>
                        <span className="total-monto">${total.toFixed(2)}</span>
                    </div>
                    {error && <p className="error-text">{error}</p>}
                </div>

                <div className="panel-ticket">
                    <h2>COMPROBANTE</h2>

                    <input
                        ref={inputFotoRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="input-foto-oculto"
                        onChange={seleccionarFoto}
                    />

                    <button
                        type="button"
                        className={`zona-foto ${previewUrl ? "con-preview" : ""}`}
                        onClick={abrirSelector}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Ticket de terminal" className="preview-ticket" />
                        ) : (
                            <div className="zona-foto-vacia">
                                <Camera size={56} strokeWidth={2} />
                                <span>Subir / tomar foto del ticket</span>
                                <p>Toca para abrir la cámara o la galería</p>
                            </div>
                        )}
                    </button>

                    {previewUrl && (
                        <button type="button" className="btn-cambiar-foto" onClick={abrirSelector}>
                            Cambiar foto
                        </button>
                    )}

                    <div className="input-referencia">
                        <label htmlFor="referencia-ticket">Referencia / folio (opcional)</label>
                        <input
                            id="referencia-ticket"
                            type="text"
                            value={referencia}
                            onChange={(event) => setReferencia(event.target.value)}
                            placeholder="Folio de la terminal"
                        />
                    </div>

                    <div className="acciones-cobro">
                        <button className="btn-secundario" onClick={() => navigate("/metodopago")}>
                            Volver
                        </button>
                        <button
                            className="btn-cobrar"
                            disabled={!puedeCobrar || procesando}
                            onClick={cobrar}
                        >
                            {procesando ? "Procesando..." : "Confirmar pago"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutTarjeta;
