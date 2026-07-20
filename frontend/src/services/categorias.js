import apiCliente from "../config/api.js";

const mensajeError = (error, fallback) =>
    error?.response?.data?.error ||
    error?.response?.data?.mensaje ||
    error?.message ||
    fallback;

export const listarCategorias = async () => {
    const { data } = await apiCliente.get("/categorias");
    return data;
};

export const obtenerCategoria = async (id) => {
    const { data } = await apiCliente.get(`/categorias/${id}`);
    return data;
};

export const guardarCategoria = async ({ id, datos, imagenFile }) => {
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
            const { data } = await apiCliente.put(`/categorias/${id}`, formData);
            return data;
        }
        const { data } = await apiCliente.post("/categorias", formData);
        return data;
    } catch (error) {
        throw new Error(mensajeError(error, "No se pudo guardar la categoría."));
    }
};

export const eliminarCategoria = async (id) => {
    try {
        const { data } = await apiCliente.delete(`/categorias/${id}`);
        return data;
    } catch (error) {
        throw new Error(mensajeError(error, "No se pudo eliminar la categoría."));
    }
};
