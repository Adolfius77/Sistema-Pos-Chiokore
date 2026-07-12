import apiCliente from "../config/api.js";

const obtenerMensajeError = (error) => {
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.response?.data?.mensaje) return error.response.data.mensaje;
    if (error?.response?.data?.message) return error.response.data.message;
    if (typeof error?.response?.data === "string") return error.response.data;
    if (error?.message) return error.message;
    return "No se pudo procesar la venta.";
};

const mapearItems = (items) =>
    items.map((item) => ({
        producto_id: Number(item.producto_id),
        cantidad: Number(item.cantidad),
        precio: Number(item.precio),
    }));

export const procesarCobro = async ({ metodoPago, montoRecibido, items }) => {
    try {
        const payload = {
            metodoPago,
            montoRecibido: Number(montoRecibido),
            items: mapearItems(items),
        };

        const response = await apiCliente.post("/ventas/cobrar", payload);
        return response.data;
    } catch (error) {
        throw new Error(obtenerMensajeError(error), { cause: error });
    }
};

export const procesarCobroTarjeta = async ({ items, referencia, ticketFile, total }) => {
    try {
        const datos = {
            metodoPago: "TARJETA",
            montoRecibido: Number(total),
            referencia: referencia?.trim() || null,
            items: mapearItems(items),
        };

        const formData = new FormData();
        formData.append(
            "datos",
            new Blob([JSON.stringify(datos)], { type: "application/json" })
        );
        formData.append("ticket", ticketFile);

        const response = await apiCliente.post("/ventas/cobrar", formData);
        return response.data;
    } catch (error) {
        throw new Error(obtenerMensajeError(error), { cause: error });
    }
};
