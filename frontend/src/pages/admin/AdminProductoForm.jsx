import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Save, ArrowLeft, Tag, DollarSign, Boxes, Package } from "lucide-react";
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
            <div className="producto-form-top">
                <button className="producto-form-back" onClick={() => navigate("/admin/productos")}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="admin-titulo">{esNuevo ? "Nuevo producto" : "Editar producto"}</h1>
                    <p className="admin-subtitulo">Completa la información del producto</p>
                </div>
            </div>

            <form className="producto-form" onSubmit={guardar} noValidate>
                <div className="producto-form-grid">
                    <div className="producto-form-left">
                        <div className="producto-seccion">
                            <h3 className="producto-seccion-titulo">
                                <Tag size={16} /> Información del producto
                            </h3>

                            <div className="producto-campo">
                                <label htmlFor="nombre" className="producto-label">Nombre del producto</label>
                                <input
                                    id="nombre"
                                    className="producto-input"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej. Vestido primavera"
                                    required
                                />
                            </div>

                            <div className="producto-fila">
                                <div className="producto-campo">
                                    <label htmlFor="precio" className="producto-label">Precio</label>
                                    <div className="producto-input-group">
                                        <span className="producto-prefijo"><DollarSign size={16} /></span>
                                        <input
                                            id="precio"
                                            className="producto-input"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={precio}
                                            onChange={(e) => setPrecio(e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="producto-campo">
                                    <label htmlFor="stock" className="producto-label">Stock disponible</label>
                                    <div className="producto-input-group">
                                        <span className="producto-prefijo"><Boxes size={16} /></span>
                                        <input
                                            id="stock"
                                            className="producto-input"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={stock}
                                            onChange={(e) => setStock(e.target.value)}
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="producto-campo">
                                <label htmlFor="categoria" className="producto-label">Categoría</label>
                                <select
                                    id="categoria"
                                    className="producto-input"
                                    value={categoriaId}
                                    onChange={(e) => setCategoriaId(e.target.value)}
                                    required
                                >
                                    {categorias.map((c) => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="producto-seccion">
                            <h3 className="producto-seccion-titulo">
                                <Package size={16} /> Estado en tienda
                            </h3>
                            <div className="producto-toggles">
                                <label className="producto-switch">
                                    <input
                                        type="checkbox"
                                        checked={activo}
                                        onChange={(e) => setActivo(e.target.checked)}
                                    />
                                    <span className="producto-switch-track" />
                                    <span className="producto-switch-label">Visible en catálogo</span>
                                </label>

                                <label className="producto-switch">
                                    <input
                                        type="checkbox"
                                        checked={esUnico}
                                        onChange={(e) => setEsUnico(e.target.checked)}
                                    />
                                    <span className="producto-switch-track" />
                                    <span className="producto-switch-label">Pieza única</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="producto-form-right">
                        <div className="producto-seccion">
                            <h3 className="producto-seccion-titulo">Foto del producto</h3>
                            <input
                                ref={inputFotoRef}
                                type="file"
                                accept="image/*"
                                className="input-foto-oculto"
                                onChange={seleccionarFoto}
                            />
                            <button
                                type="button"
                                className={`producto-foto ${previewUrl ? "con-foto" : ""}`}
                                onClick={() => inputFotoRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Producto" className="producto-foto-img" />
                                ) : (
                                    <div className="producto-foto-vacio">
                                        <Camera size={40} />
                                        <strong>Sube una foto</strong>
                                        <span>Haz clic para seleccionar</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="producto-error">
                        <strong>{error}</strong>
                    </div>
                )}

                <div className="producto-acciones">
                    <button type="button" className="producto-btn producto-btn--ghost" onClick={() => navigate("/admin/productos")}>
                        Cancelar
                    </button>
                    <button type="submit" className="producto-btn producto-btn--primary" disabled={guardando}>
                        <Save size={16} />
                        {guardando ? "Guardando..." : "Guardar producto"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductoForm;