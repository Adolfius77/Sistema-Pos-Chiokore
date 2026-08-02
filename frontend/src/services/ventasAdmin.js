import apiCliente from "../config/api.js";

const mensajeError = (error, fallback) =>
    error?.response?.data?.error ||
    error?.response?.data?.mensaje ||
    error?.message ||
    fallback;

export const listarVentasPorFecha = async (fecha) => {
    const params = typeof fecha === "string"
        ? { fecha }
        : {
            fecha: fecha?.fecha,
            desde: fecha?.desde,
            hasta: fecha?.hasta,
        };
    const { data } = await apiCliente.get("/ventas/dia", { params });
    return data;
};

export const obtenerVentaDetalle = async (id) => {
    try {
        const { data } = await apiCliente.get(`/ventas/${id}`);
        return data;
    } catch (error) {
        throw new Error(mensajeError(error, "No se pudo cargar la venta."), { cause: error });
    }
};

export const obtenerResumenVentas = async (fecha) => {
    const { data } = await apiCliente.get("/ventas/resumen-dia", { params: { fecha } });
    return data;
};

export const obtenerResumenRango = async (desde, hasta) => {
    try {
        const { data } = await apiCliente.get("/ventas", { params: { desde, hasta } });
        return data; // VentasResumenDTO with numVentas and total (server returns VentasResumenDTO)
    } catch (error) {
        throw new Error(mensajeError(error, "No se pudo obtener el resumen."), { cause: error });
    }
};

export const descargarReporteVentasExcel = async ({ desde, hasta }) => {
    try {
        const response = await apiCliente.get("/ventas/reporte-excel", {
            params: { desde, hasta },
            responseType: "blob",
        });

        const contentDisposition = response.headers["content-disposition"] || "";
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
        const filename = filenameMatch?.[1] || `reporte-ventas-${desde}-a-${hasta}.xlsx`;

        return { blob: response.data, filename };
    } catch (error) {
        throw new Error(mensajeError(error, "No se pudo descargar el reporte en Excel."), { cause: error });
    }
};

export const cancelarVenta = async (id) => {
    try {
        const { data } = await apiCliente.post(`/ventas/${id}/cancelar`);
        // API devuelve { mensaje, venta }
        return data;
    } catch (error) {
        throw new Error(mensajeError(error, "No se pudo cancelar la venta."), { cause: error });
    }
};
