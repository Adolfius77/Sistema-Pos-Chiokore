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

const limpiarModelo = (v) =>
    (v || "").trim().replace(/\s+/g, " ");

const marcaDesdeBrands = () => {
    if (!navigator?.userAgentData?.brands) return "";
    const noMarca = /^Not[ _]A[ _]Brand$/i;
    const util = navigator.userAgentData.brands.find((b) => noMarca.test(b.brand));
    // Escoger la marca "real" priorizando las que no son el motor ni el browser base
    const prioridad = ["Samsung", "Huawei", "Xiaomi", "OPPO", "Vivo", "Realme", "OnePlus", "Honor", "Lenovo", "Google", "Apple"];
    for (const p of prioridad) {
        const hit = navigator.userAgentData.brands.find((b) => b.brand && b.brand.toLowerCase().includes(p.toLowerCase()));
        if (hit) return p;
    }
    return util?.brand?.replace("Generic ", "") || "";
};

const tipoAndroid = () => {
    // "tablet" si no es móvil en la marca mobile de client hints o por UA reducido
    const mobile = navigator?.userAgentData?.mobile;
    if (mobile === true) return "Teléfono Android";
    const ua = navigator?.userAgent || "";
    return /\bMobile\b/i.test(ua) ? "Teléfono Android" : "Tablet Android";
};

const modeloDesdeUserAgent = () => {
    const ua = navigator?.userAgent || "";

    // Samsung/Android con modelo tipo "SM-T510", "SM-G991B", etc.
    const samsung = ua.match(/SM-[A-Z0-9]{3,6}/i);
    if (samsung?.[0]) return "Samsung " + samsung[0].toUpperCase();

    // Modelo genérico Android: "Linux; Android 10; NOMBRE_DEL_MODELO)"
    // Ojo: Chrome reduce el UA y reemplaza el modelo por "K" (placeholder) en tablets.
    const modeloAndroid = ua.match(/Android\s[\d.]+;\s([^;)]+)\)/i);
    if (modeloAndroid?.[1]) {
        const m = limpiarModelo(modeloAndroid[1]);
        // rechaza placeholders del UA reducido: "K", "Unknown", tokens de 1-2 chars
        if (m && m.length >= 3 && !/unknown|generic|phone|tablet/i.test(m)) return m;
    }

    if (/\biPhone\b/i.test(ua)) {
        const ver = ua.match(/iPhone OS ([\d_]+)/i);
        return ver ? `iPhone (iOS ${ver[1].replace(/_/g, ".")})` : "iPhone";
    }
    if (/\biPad\b/i.test(ua)) return "iPad";
    if (/\biPod\b/i.test(ua)) return "iPod";
    if (/\bWindows\b/i.test(ua)) return "Windows PC";
    if (/\bMacintosh\b/i.test(ua) || /\bMac OS X\b/i.test(ua)) return "Mac";
    if (/\bAndroid\b/i.test(ua)) return tipoAndroid();

    return "";
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
                "architecture",
            ]);

            const modeloEntropy = limpiarModelo(entropy?.model);
            const marca = marcaDesdeBrands();

            if (modeloEntropy) {
                const marcaYaIncluida = marca && modeloEntropy.toLowerCase().includes(marca.toLowerCase());
                return marcaYaIncluida ? modeloEntropy : (marca ? `${marca} ${modeloEntropy}` : modeloEntropy);
            }

            // Sin modelo high-entropy: usar plataforma + versión
            const plataforma = [entropy?.platform, entropy?.platformVersion].filter(Boolean).join(" ");
            if (plataforma) return plataforma;

            const uaModelo = modeloDesdeUserAgent();
            if (uaModelo) return uaModelo;

            if (marca) return marca;
        } catch {
            // sigue con fallbacks
        }
    }

    const uaModelo = modeloDesdeUserAgent();
    if (uaModelo) return uaModelo;

    const marca = marcaDesdeBrands();
    if (marca) return marca;

    // Nunca devolver el UA crudo; dar una etiqueta legible según plataforma
    const platform = navigator?.userAgentData?.platform;
    const esAndroid = /\bAndroid\b/i.test(navigator?.userAgent || "") || platform === "Android";
    if (esAndroid) return tipoAndroid();
    if (platform) return platform;
    return "Dispositivo desconocido";
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
