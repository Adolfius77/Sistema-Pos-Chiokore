import { FaTshirt, FaGamepad, FaCouch, FaBoxOpen } from "react-icons/fa";
const categoriasData = [
    { id: 1, nombre: 'Ropa', items: 12, icono: <FaTshirt size={36} />, color: '#ff9800' },
    { id: 2, nombre: 'Juguetes', items: 8, icono: <FaGamepad size={36} />, color: '#dc3545' },
    { id: 3, nombre: 'Muebles', items: 24, icono: <FaCouch size={36} />, color: '#0d6efd' },
    { id: 4, nombre: 'Otros', items: 6, icono: <FaBoxOpen size={36} />, color: '#e83e8c' },
];

const Categorias = () => {
    return (
        <div className="categorias-section">
            <h2 className="categorias-title">SELECCIONA UNA CATEGORIA</h2>

            <div className="categorias-list">
                {categoriasData.map((cat) => (

                    <div key={cat.id} className="categoria-card">
                        <div className="categoria-card-body">

                            <div
                                className="icono-circulo"
                                style={{
                                    '--color-fondo': `${cat.color}20`,
                                    '--color-icono': cat.color
                                }}
                            >
                                {cat.icono}
                            </div>

                            <h5 className="categoria-nombre">{cat.nombre}</h5>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Categorias;