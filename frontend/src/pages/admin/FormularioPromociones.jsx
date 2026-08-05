import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Save, ArrowLeft, Tag, DollarSign, Boxes, CalendarDays, Percent } from 'lucide-react';
import { urlUpload } from '../../config/env';
import { listarCategorias } from '../../services/categorias';
import apiCliente from '../../config/api';

const FormularioPromociones = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const esNuevo = !id;
    const inputFotoRef = useRef(null);
    const [categorias, setCategorias] = useState([]);
    const [promo, setPromo] = useState({
        nombre: '',
        cantidadPaquete: 1,
        precioPaquete: 0,
        fechaInicio: '',
        fechaFin: '',
        descuento: 0,
        precioPromocional: 0,
        activo: true,
        categoria: { id: '' }
    });
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        listarCategorias().then(setCategorias);
        if (!esNuevo) {
            apiCliente.get(`/promociones/${id}`).then(res => {
                setPromo(res.data);
                if (res.data.url_imagen) setPreviewUrl(urlUpload(res.data.url_imagen));
            });
        }
    }, [id, esNuevo]);

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const seleccionarFoto = (event) => {
        const f = event.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            setError("Selecciona una imagen JPG, PNG o WEBP.");
            return;
        }
        if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('promocion', new Blob([JSON.stringify(promo)], { type: 'application/json' }));
        if (file) formData.append('imagen', file);

        try {
            setGuardando(true);
            setError("");
            if (esNuevo) {
                await apiCliente.post(`/promociones`, formData);
            } else {
                await apiCliente.put(`/promociones/${id}`, formData);
            }
            navigate('/admin/promociones');
        } catch (err) {
            setError(err.response?.data?.mensaje || err.response?.data?.error || err.message || 'No se pudo guardar la promoción.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="producto-form-top">
                <button className="producto-form-back" onClick={() => navigate("/admin/promociones")}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="admin-titulo">{esNuevo ? "Nueva promoción" : "Editar promoción"}</h1>
                    <p className="admin-subtitulo">Completa la información de la promoción</p>
                </div>
            </div>

            <form className="producto-form" onSubmit={handleSubmit} noValidate>
                <div className="producto-form-grid">
                    <div className="producto-form-left">
                        <div className="producto-seccion">
                            <h3 className="producto-seccion-titulo">
                                <Tag size={16} /> Información de la promoción
                            </h3>

                            <div className="producto-campo">
                                <label className="producto-label">Nombre de la promoción</label>
                                <input
                                    className="producto-input"
                                    value={promo.nombre}
                                    onChange={e => setPromo({ ...promo, nombre: e.target.value })}
                                    placeholder="Ej. Pantalones 2x1"
                                    required
                                />
                            </div>

                            <div className="producto-campo">
                                <label className="producto-label">Categoría</label>
                                <select
                                    className="producto-input"
                                    value={promo.categoria?.id}
                                    onChange={e => setPromo({ ...promo, categoria: { id: parseInt(e.target.value) } })}
                                    required
                                >
                                    <option value="">Selecciona categoría</option>
                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="producto-seccion">
                            <h3 className="producto-seccion-titulo">
                                <DollarSign size={16} /> Precios
                            </h3>

                            <div className="producto-campo">
                                <label className="producto-label">Precio por pieza</label>
                                <div className="producto-input-group">
                                    <span className="producto-prefijo"><DollarSign size={16} /></span>
                                    <input
                                        className="producto-input"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={promo.precioPromocional}
                                        onChange={e => setPromo({ ...promo, precioPromocional: parseFloat(e.target.value) })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="producto-fila">
                                <div className="producto-campo">
                                    <label className="producto-label">Cantidad del paquete</label>
                                    <div className="producto-input-group">
                                        <span className="producto-prefijo"><Boxes size={16} /></span>
                                        <input
                                            className="producto-input"
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={promo.cantidadPaquete}
                                            onChange={e => setPromo({ ...promo, cantidadPaquete: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="producto-campo">
                                    <label className="producto-label">Precio del paquete</label>
                                    <div className="producto-input-group">
                                        <span className="producto-prefijo"><DollarSign size={16} /></span>
                                        <input
                                            className="producto-input"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={promo.precioPaquete}
                                            onChange={e => setPromo({ ...promo, precioPaquete: parseFloat(e.target.value) })}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="producto-seccion">
                            <h3 className="producto-seccion-titulo">
                                <CalendarDays size={16} /> Vigencia
                            </h3>

                            <div className="producto-fila">
                                <div className="producto-campo">
                                    <label className="producto-label">Fecha de inicio</label>
                                    <input
                                        className="producto-input"
                                        type="date"
                                        value={promo.fechaInicio}
                                        onChange={e => setPromo({ ...promo, fechaInicio: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="producto-campo">
                                    <label className="producto-label">Fecha de fin</label>
                                    <input
                                        className="producto-input"
                                        type="date"
                                        value={promo.fechaFin}
                                        onChange={e => setPromo({ ...promo, fechaFin: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="producto-seccion">
                            <h3 className="producto-seccion-titulo">
                                <Percent size={16} /> Estado
                            </h3>

                            <div className="producto-toggles">
                                <label className="producto-switch">
                                    <input
                                        type="checkbox"
                                        checked={promo.activo}
                                        onChange={e => setPromo({ ...promo, activo: e.target.checked })}
                                    />
                                    <span className="producto-switch-track" />
                                    <span className="producto-switch-label">Promoción activa</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="producto-form-right">
                        <div className="producto-seccion">
                            <h3 className="producto-seccion-titulo">Foto de la promoción</h3>
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
                                    <img src={previewUrl} alt="Promoción" className="producto-foto-img" />
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
                    <button type="button" className="producto-btn producto-btn--ghost" onClick={() => navigate("/admin/promociones")}>
                        Cancelar
                    </button>
                    <button type="submit" className="producto-btn producto-btn--primary" disabled={guardando}>
                        <Save size={16} />
                        {guardando ? "Guardando..." : "Guardar promoción"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioPromociones;