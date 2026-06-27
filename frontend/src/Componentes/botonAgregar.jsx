import React, {useState} from "react";

const BotonAgregar = ({producto,onAgregar}) => {
    const[agregado, setAgregado] = useState(false);

    const manejarClick = () =>{
        onAgregar(producto);
        setAgregado(true);
        setTimeout(() => {
            setAgregado(false);
        }, 1000);
    };
    const sinStock = producto.stock === 0;
    return(
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
