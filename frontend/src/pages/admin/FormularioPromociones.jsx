import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Camera } from 'lucide-react';
import { API_BASE_URL, urlUpload } from '../../config/env';
import { listarCategorias } from '../../services/categorias';
import apiCliente from '../../config/api';

const FormularioPromociones = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const esNuevo = !id;
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
    const inputFotoRef = useRef(null);

    useEffect(() => {
        listarCategorias().then(setCategorias);
        if (!esNuevo) {
            apiCliente.get(`/promociones/${id}`).then(res => {
                setPromo(res.data);
                if (res.data.url_imagen) setPreviewUrl(urlUpload(res.data.url_imagen));
            });
        }
    }, [id, esNuevo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('promocion', new Blob([JSON.stringify(promo)], { type: 'application/json' }));
        if (file) formData.append('imagen', file);

        try {
            if (esNuevo) {
                await axios.post(`${API_BASE_URL}/api/promociones`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await axios.put(`${API_BASE_URL}/api/promociones/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            alert('Promoción guardada correctamente');
            navigate('/admin/promociones');
        } catch (error) {
            console.error(error);
            alert('Error al guardar: ' + (error.response?.data?.mensaje || error.message));
        }
    };

    return (
        <div className="admin-page">
            <h1 className="admin-titulo">{esNuevo ? "NUEVA PROMOCIÓN" : "EDITAR PROMOCIÓN"}</h1>
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form-grid">
                    <div className="admin-form-campos">
                        <label>Nombre</label>
                        <input value={promo.nombre} onChange={e => setPromo({...promo, nombre: e.target.value})} required />
                        
                        <label>Categoría</label>
                        <select value={promo.categoria?.id} onChange={e => setPromo({...promo, categoria: { id: parseInt(e.target.value) }})} required>
                            <option value="">Selecciona categoría</option>
                            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>

                        <label>Precio por pieza $</label>
                        <input type="number" step="0.01" value={promo.precioPromocional} onChange={e => setPromo({...promo, precioPromocional: parseFloat(e.target.value)})} required />
                        
                        <label>Fechas</label>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <input type="date" value={promo.fechaInicio} onChange={e => setPromo({...promo, fechaInicio: e.target.value})} required />
                            <input type="date" value={promo.fechaFin} onChange={e => setPromo({...promo, fechaFin: e.target.value})} required />
                        </div>

                        <label>Paquete</label>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <input type="number" placeholder="Cant" value={promo.cantidadPaquete} onChange={e => setPromo({...promo, cantidadPaquete: parseInt(e.target.value)})} required />
                            <input type="number" placeholder="Precio" value={promo.precioPaquete} onChange={e => setPromo({...promo, precioPaquete: parseFloat(e.target.value)})} required />
                        </div>
                    </div>

                    <div className="admin-form-foto">
                        <input ref={inputFotoRef} type="file" accept="image/*" className="input-foto-oculto" onChange={e => {
                            setFile(e.target.files[0]);
                            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                        }} />
                        <button type="button" className="zona-foto admin-zona-foto" onClick={() => inputFotoRef.current.click()}>
                            {previewUrl ? <img src={previewUrl} alt="Preview" className="preview-ticket" /> : <Camera size={48} />}
                        </button>
                    </div>
                </div>
                <button type="submit" className="btn-cobrar">Guardar Promoción</button>
            </form>
        </div>
    );
};

export default FormularioPromociones;
