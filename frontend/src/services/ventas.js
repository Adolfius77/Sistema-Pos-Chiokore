import apiCliente from "../config/api.js";

const obtenerMensajeError = (error) => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (typeof error?.response?.data === "string") return error.response.data;
    if (error?.message) return error.message;
    return "No se pudo procesar la venta.";
};

export const procesarCobro = async ({ metodoPago, montoRecibido, items }) => {
    try {
        const payload = {
            metodoPago,
            montoRecibido: Number(montoRecibido),
            items: items.map((item) => ({
                producto_id: Number(item.producto_id),
                cantidad: Number(item.cantidad),
                precio: Number(item.precio)
            })),
        };

        const response = await apiCliente.post("/ventas/cobrar", payload);
        return response.data;
    } catch (error) {
        throw new Error(obtenerMensajeError(error), { cause: error });
    }
};