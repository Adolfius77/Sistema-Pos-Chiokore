import { FaHamburger, FaPizzaSlice, FaCocktail, FaIceCream } from "react-icons/fa";

const categoriasData = [
    { id: 1, nombre: 'Ropa',  icono: <FaHamburger size={36} />, color: '#ff9800' },
    { id: 2, nombre: 'Juguetes',  icono: <FaPizzaSlice size={36} />, color: '#dc3545' },
    { id: 3, nombre: 'Muebles', icono: <FaCocktail size={36} />, color: '#0d6efd' },
    { id: 4, nombre: 'Otros',  icono: <FaIceCream size={36} />, color: '#e83e8c' },
];

const Categorias = () => {
    return (
        <div className="categorias-section">
            <h2 className="categorias-title">Selecciona una categoria</h2>

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