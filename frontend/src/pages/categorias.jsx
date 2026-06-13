import { FaHamburger, FaPizzaSlice, FaCocktail, FaIceCream, FaCoffee, FaUtensils } from "react-icons/fa";

const categoriasData = [
    { id: 1, nombre: 'Hamburguesas', items: 12, icono: <FaHamburger size={36} />, color: '#ff9800' },
    { id: 2, nombre: 'Pizzas', items: 8, icono: <FaPizzaSlice size={36} />, color: '#dc3545' },
    { id: 3, nombre: 'Bebidas', items: 24, icono: <FaCocktail size={36} />, color: '#0d6efd' },
    { id: 4, nombre: 'Postres', items: 6, icono: <FaIceCream size={36} />, color: '#e83e8c' },
    { id: 5, nombre: 'Cafetería', items: 10, icono: <FaCoffee size={36} />, color: '#795548' },
    { id: 6, nombre: 'Combos', items: 5, icono: <FaUtensils size={36} />, color: '#198754' }
];

const Categorias = () => {
    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 fw-bold">Categorías</h2>

            <div className="row g-4">
                {categoriasData.map((cat) => (
                    <div key={cat.id} className="col-6 col-md-4 col-lg-3">

                        <div className="card border-0 shadow-sm h-100 categoria-card">
                            <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">

                                <div
                                    className="icono-circulo"
                                    style={{
                                        '--color-fondo': `${cat.color}20`,
                                        '--color-icono': cat.color
                                    }}
                                >
                                    {cat.icono}
                                </div>

                                <h5 className="fw-bold mb-1 text-center">{cat.nombre}</h5>
                                <small className="text-muted">{cat.items} items</small>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Categorias;