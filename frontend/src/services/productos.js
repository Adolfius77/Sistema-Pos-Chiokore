import apiCliente from "../config/api.js";

const mensajeError = (error, fallback) =>
    error?.response?.data?.error ||
    error?.response?.data?.mensaje ||
    error?.message ||
    fallback;

export const listarProductos = async () => {
    const { data } = await apiCliente.get("/productos");
    return data;
};

export const obtenerProducto = async (id) => {
    const { data } = await apiCliente.get(`/productos/${id}`);
    return data;
};

export const guardarProducto = async ({ id, datos, imagenFile }) => {
    try {
        const formData = new FormData();
        formData.append(
            "datos",
            new Blob([JSON.stringify(datos)], { type: "application/json" })
        );
        if (imagenFile) {
            formData.append("imagen", imagenFile);
        }

        if (id) {
            const { data } = await apiCliente.put(`/productos/${id}`, formData);
            return data;
        }
        const { data } = await apiCliente.post("/productos", formData);
        return data;
    } catch (error) {
        throw new Error(mensajeError(error, "No se pudo guardar el producto."));
    }
};

export const cambiarActivoProducto = async (id, activo) => {
    try {
        const { data } = await apiCliente.patch(`/productos/${id}/activo`, { activo });
        return data;
    } catch (error) {
        throw new Error(mensajeError(error, "No se pudo actualizar el estado."));
    }
};
