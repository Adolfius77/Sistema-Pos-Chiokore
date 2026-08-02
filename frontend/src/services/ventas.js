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

const modeloDesdeUserAgent = () => {
    const ua = navigator?.userAgent || "";
    const androidMatch = ua.match(/Android\s[\d.]+;\s([^)]+)\sBuild\//i);
    if (androidMatch?.[1]) return androidMatch[1].trim();
    if (/\biPhone\b/i.test(ua)) return "iPhone";
    if (/\biPad\b/i.test(ua)) return "iPad";
    if (/\bWindows\b/i.test(ua)) return "Windows PC";
    if (/\bMacintosh\b/i.test(ua)) return "Mac";
    return ua || "Dispositivo desconocido";
};

const obtenerModeloDispositivo = async () => {
    if (typeof navigator === "undefined") return "Dispositivo desconocido";
    const uaData = navigator.userAgentData;

    if (uaData?.getHighEntropyValues) {
        try {
            const entropy = await uaData.getHighEntropyValues([
                "model",
                "platform",
                "platformVersion",
            ]);

            if (entropy?.model) return entropy.model;

            const plataforma = [entropy?.platform, entropy?.platformVersion]
                .filter(Boolean)
                .join(" ");

            return plataforma || modeloDesdeUserAgent();
        } catch {
            return modeloDesdeUserAgent();
        }
    }

    return modeloDesdeUserAgent();
};

export const procesarCobro = async ({ metodoPago, montoRecibido, items }) => {
    try {
        const modeloDispositivo = await obtenerModeloDispositivo();
        const payload = {
            metodoPago,
            montoRecibido: Number(montoRecibido),
            modeloDispositivo,
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
        const modeloDispositivo = await obtenerModeloDispositivo();
        const datos = {
            metodoPago: "TARJETA",
            montoRecibido: Number(total),
            referencia: referencia?.trim() || null,
            modeloDispositivo,
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
