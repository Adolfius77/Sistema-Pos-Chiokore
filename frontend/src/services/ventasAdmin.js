import apiCliente from "../config/api.js";

const mensajeError = (error, fallback) =>
    error?.response?.data?.error ||
    error?.response?.data?.mensaje ||
    error?.message ||
    fallback;

export const listarVentasPorFecha = async (fecha) => {
    const { data } = await apiCliente.get("/ventas/dia", { params: { fecha } });
    return data;
};

export const obtenerVentaDetalle = async (id) => {
    try {
        const { data } = await apiCliente.get(`/ventas/${id}`);
        return data;
    } catch (error) {
        throw new Error(mensajeError(error, "No se pudo cargar la venta."));
    }
};

export const obtenerResumenVentas = async (fecha) => {
    const { data } = await apiCliente.get("/ventas/resumen-dia", { params: { fecha } });
    return data;
};
