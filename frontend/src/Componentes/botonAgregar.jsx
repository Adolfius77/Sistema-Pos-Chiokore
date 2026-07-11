import { useState } from "react";
import { useCart } from "../context/useCart.js";
import { ShoppingCart } from "lucide-react"; // 1. Importamos el ícono

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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ShoppingCart size={20} />
                    Agregar al Carrito
                </div>
            )}
        </button>
    );
};

export default BotonAgregar;