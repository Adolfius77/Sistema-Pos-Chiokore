import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";

const BotonAgregar = ({ producto }) => {
    const { addToCart } = useContext(CartContext);

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
            {sinStock
                ? 'Sin existencias'
                : agregado
                    ? '¡Agregado! ✔️'
                    : 'Agregar al Carrito'
            }
        </button>
    );
};

export default BotonAgregar;