//metodo para calcular el subtotal de un item aplicando su promocion
export const calcularSubtotalItem = (item) => {
    const cantidad = Number(item?.cantidad ?? 0);
    if (cantidad < 1) return 0;

    const precioBase = Number(item?.precioOriginal ?? item?.precio ?? 0);
    const { paquetes, resto } = repartirEnPaquetes(item, cantidad, precioBase);
    if (paquetes === 0) return precioBase * cantidad;

    // El descuento solo premia el paquete completo: lo que sobra va a precio de lista.
    return (paquetes * Number(item.precioPaquete)) + (resto * precioBase);
};

//metodo para describir la promocion que de verdad se aplico a la cantidad del item
export const descripcionPromocionItem = (item) => {
    const cantidad = Number(item?.cantidad ?? 0);
    if (cantidad < 1) return null;

    const precioBase = Number(item?.precioOriginal ?? item?.precio ?? 0);
    const { paquetes, resto } = repartirEnPaquetes(item, cantidad, precioBase);
    if (paquetes === 0) return null;

    const cantidadPaquete = Number(item.cantidadPaquete);
    const precioPaquete = Number(item.precioPaquete);
    const base = `${paquetes} paquete${paquetes > 1 ? "s" : ""} de ${cantidadPaquete} x $${precioPaquete.toFixed(2)}`;
    return resto > 0 ? `${base} + ${resto} a $${precioBase.toFixed(2)}` : base;
};

//metodo para saber cuantos paquetes completos se llevan y cuantas piezas sobran
const repartirEnPaquetes = (item, cantidad, precioBase) => {
    const cantidadPaquete = Number(item?.cantidadPaquete ?? 0);
    const precioPaquete = Number(item?.precioPaquete ?? 0);

    const paqueteValido = cantidadPaquete >= 2
        && precioPaquete > 0
        && cantidad >= cantidadPaquete
        && precioPaquete < cantidadPaquete * precioBase;

    if (!paqueteValido) return { paquetes: 0, resto: cantidad };

    return {
        paquetes: Math.floor(cantidad / cantidadPaquete),
        resto: cantidad % cantidadPaquete,
    };
};

//metodo para calcular el total del carrito aplicando promociones
export const calcularTotalConPromociones = (carrito) =>
    (carrito || []).reduce((total, item) => total + calcularSubtotalItem(item), 0);
