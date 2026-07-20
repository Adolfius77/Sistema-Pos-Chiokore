import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import {
    listarCategorias,
    guardarCategoria,
    eliminarCategoria,
} from "../../services/categorias.js";
import { urlUpload } from "../../config/env.js";

const formVacio = { id: null, nombre: "", imagenFile: null, previewUrl: "" };

const AdminCategorias = () => {
    const inputFotoRef = useRef(null);
    const [categorias, setCategorias] = useState([]);
    const [form, setForm] = useState(formVacio);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const cargar = async () => {
        try {
            setCategorias(await listarCategorias());
            setError("");
        } catch {
            setError("No se pudieron cargar las categorías.");
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    useEffect(() => {
        return () => {
            if (form.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(form.previewUrl);
        };
    }, [form.previewUrl]);

    const editar = (cat) => {
        if (form.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(form.previewUrl);
        setForm({
            id: cat.id,
            nombre: cat.nombre,
            imagenFile: null,
            previewUrl: urlUpload(cat.url_imagen) || "",
        });
    };

    const limpiarForm = () => {
        if (form.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(form.previewUrl);
        setForm(formVacio);
    };

    const seleccionarFoto = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Selecciona una imagen JPG, PNG o WEBP.");
            return;
        }
        if (form.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(form.previewUrl);
        setForm((prev) => ({
            ...prev,
            imagenFile: file,
            previewUrl: URL.createObjectURL(file),
        }));
        setError("");
    };

    const guardar = async (event) => {
        event.preventDefault();
        if (!form.nombre.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }
        try {
            setGuardando(true);
            await guardarCategoria({
                id: form.id,
                datos: { nombre: form.nombre.trim() },
                imagenFile: form.imagenFile,
            });
            limpiarForm();
            await cargar();
        } catch (e) {
            setError(e.message);
        } finally {
            setGuardando(false);
        }
    };

    const eliminar = async (id) => {
        if (!window.confirm("¿Eliminar esta categoría?")) return;
        try {
            await eliminarCategoria(id);
            if (form.id === id) limpiarForm();
            await cargar();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="admin-page">
            <h1 className="admin-titulo">CATEGORÍAS</h1>
            <p className="admin-subtitulo">Crea y edita las categorías del catálogo</p>

            <div className="admin-split">
                <form className="admin-form admin-form-panel" onSubmit={guardar}>
                    <h2>{form.id ? "Editar categoría" : "Nueva categoría"}</h2>

                    <label htmlFor="cat-nombre">Nombre</label>
                    <input
                        id="cat-nombre"
                        value={form.nombre}
                        onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                        required
                    />

                    <input
                        ref={inputFotoRef}
                        type="file"
                        accept="image/*"
                        className="input-foto-oculto"
                        onChange={seleccionarFoto}
                    />
                    <button
                        type="button"
                        className="zona-foto admin-zona-foto"
                        onClick={() => inputFotoRef.current?.click()}
                    >
                        {form.previewUrl ? (
                            <img src={form.previewUrl} alt="Categoría" className="preview-ticket" />
                        ) : (
                            <div className="zona-foto-vacia">
                                <Camera size={40} />
                                <span>Foto de categoría</span>
                            </div>
                        )}
                    </button>

                    {error && <p className="admin-error">{error}</p>}

                    <div className="acciones-cobro">
                        {form.id && (
                            <button type="button" className="btn-secundario" onClick={limpiarForm}>
                                Limpiar
                            </button>
                        )}
                        <button type="submit" className="btn-cobrar" disabled={guardando}>
                            {guardando ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>

                <div className="admin-lista">
                    {categorias.map((cat) => (
                        <div key={cat.id} className="admin-lista-item">
                            <img
                                src={urlUpload(cat.url_imagen) || "https://placehold.co/120x120/eeeeee/666666?text=Cat"}
                                alt={cat.nombre}
                                className="admin-lista-foto"
                            />
                            <div className="admin-lista-info">
                                <h2>{cat.nombre}</h2>
                            </div>
                            <div className="admin-lista-acciones">
                                <button className="tactile-btn admin-btn-secondary" onClick={() => editar(cat)}>
                                    Editar
                                </button>
                                <button className="tactile-btn admin-btn-danger" onClick={() => eliminar(cat.id)}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminCategorias;
