import { useState } from "react";
import { useCart } from "../context/useCart.js";
import { ShoppingCart } from "lucide-react";

const BotonAgregar = ({ producto }) => {
    const { addToCart } = useCart();

    const [agregado, setAgregado] = useState(false);

    const manejarClick = () => {
        addToCart(producto);
        setAgregado(true);

        setTimeout(() => {
            setAgregado(false);
        }, 1000);
    };

    const sinStock = producto.stock === 0;

    return (
        <button
            className={`btn-agregar ${agregado ? 'agregado-exito' : ''}`}
            disabled={sinStock || agregado}
            onClick={manejarClick}
        >
            {sinStock ? (
                'Sin existencias'
            ) : agregado ? (
                '¡Agregado! ✔️'
            ) : (
                <>
                    <span>Agregar al carrito</span>
                    <ShoppingCart className="icono-carrito" size={20} />
                </>
            )}
        </button>
    );
};

export default BotonAgregar;