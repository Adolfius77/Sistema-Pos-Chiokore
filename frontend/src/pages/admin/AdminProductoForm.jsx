import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera } from "lucide-react";
import { listarCategorias } from "../../services/categorias.js";
import { obtenerProducto, guardarProducto } from "../../services/productos.js";
import { urlUpload } from "../../config/env.js";

const AdminProductoForm = () => {
    const { id } = useParams();
    const esNuevo = !id || id === "nuevo";
    const navigate = useNavigate();
    const inputFotoRef = useRef(null);

    const [categorias, setCategorias] = useState([]);
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [stock, setStock] = useState("1");
    const [categoriaId, setCategoriaId] = useState("");
    const [activo, setActivo] = useState(true);
    const [esUnico, setEsUnico] = useState(false);
    const [imagenFile, setImagenFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        listarCategorias()
            .then((cats) => {
                setCategorias(cats);
                if (cats.length && !categoriaId) setCategoriaId(String(cats[0].id));
            })
            .catch(() => setError("No se pudieron cargar las categorías."));
    }, []);

    useEffect(() => {
        if (esNuevo) return;
        obtenerProducto(id)
            .then((p) => {
                setNombre(p.nombre || "");
                setPrecio(String(p.precio ?? ""));
                setStock(String(p.stock ?? "0"));
                setCategoriaId(String(p.categoria?.id || ""));
                setActivo(!!p.activo);
                setEsUnico(!!(p.es_Unico ?? p.esUnico));
                if (p.url_imagen) setPreviewUrl(urlUpload(p.url_imagen));
            })
            .catch(() => setError("No se pudo cargar el producto."));
    }, [id, esNuevo]);

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const seleccionarFoto = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Selecciona una imagen JPG, PNG o WEBP.");
            return;
        }
        if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
        setImagenFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError("");
    };

    const guardar = async (event) => {
        event.preventDefault();
        if (!nombre.trim() || !categoriaId) {
            setError("Nombre y categoría son obligatorios.");
            return;
        }

        try {
            setGuardando(true);
            setError("");
            await guardarProducto({
                id: esNuevo ? null : id,
                datos: {
                    nombre: nombre.trim(),
                    precio: Number(precio) || 0,
                    stock: Number.parseInt(stock, 10) || 0,
                    categoriaId: Number(categoriaId),
                    activo,
                    esUnico,
                },
                imagenFile,
            });
            navigate("/admin/productos");
        } catch (e) {
            setError(e.message);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="admin-page">
            <h1 className="admin-titulo">{esNuevo ? "NUEVO PRODUCTO" : "EDITAR PRODUCTO"}</h1>

            <form className="admin-form" onSubmit={guardar}>
                <div className="admin-form-grid">
                    <div className="admin-form-campos">
                        <label htmlFor="nombre">Nombre</label>
                        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

                        <label htmlFor="precio">Precio</label>
                        <input
                            id="precio"
                            type="number"
                            min="0"
                            step="0.01"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            required
                        />

                        <label htmlFor="stock">Stock</label>
                        <input
                            id="stock"
                            type="number"
                            min="0"
                            step="1"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                        />

                        <label htmlFor="categoria">Categoría</label>
                        <select
                            id="categoria"
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            required
                        >
                            {categorias.map((c) => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>

                        <div className="admin-toggles">
                            <label className="admin-toggle">
                                <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
                                Activo
                            </label>
                            <label className="admin-toggle">
                                <input type="checkbox" checked={esUnico} onChange={(e) => setEsUnico(e.target.checked)} />
                                Pieza única
                            </label>
                        </div>
                    </div>

                    <div className="admin-form-foto">
                        <input
                            ref={inputFotoRef}
                            type="file"
                            accept="image/*"
                            className="input-foto-oculto"
                            onChange={seleccionarFoto}
                        />
                        <button type="button" className="zona-foto admin-zona-foto" onClick={() => inputFotoRef.current?.click()}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Producto" className="preview-ticket" />
                            ) : (
                                <div className="zona-foto-vacia">
                                    <Camera size={48} />
                                    <span>Foto del producto</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {error && <p className="admin-error">{error}</p>}

                <div className="acciones-cobro">
                    <button type="button" className="btn-secundario" onClick={() => navigate("/admin/productos")}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-cobrar" disabled={guardando}>
                        {guardando ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductoForm;
