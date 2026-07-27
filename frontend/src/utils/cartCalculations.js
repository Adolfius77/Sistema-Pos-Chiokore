/**
 * Calcula el total del carrito aplicando promociones de volumen por categoría.
 * @param {Array} carrito - Items en el carrito.
 * @param {Array} promocionesActivas - Promociones obtenidas del backend.
 */
export const calcularTotalConPromociones = (carrito, promocionesActivas) => {
    const porCategoria = carrito.reduce((acc, item) => {
        const catId = item.categoria?.id;
        if (!catId) return acc;
        if (!acc[catId]) acc[catId] = { items: [], total: 0 };
        acc[catId].items.push(item);
        return acc;
    }, {});

    let totalFinal = 0;

    Object.keys(porCategoria).forEach(catId => {
        const promo = promocionesActivas.find(p => p.categoria?.id == catId);
        const grupo = porCategoria[catId];
        const cantidadTotalCat = grupo.items.reduce((sum, i) => sum + i.cantidad, 0);

        if (promo && promo.activo) {
            const numPaquetes = Math.floor(cantidadTotalCat / promo.cantidadPaquete);
            const sobrantes = cantidadTotalCat % promo.cantidadPaquete;
            
            const precioUnitario = grupo.items[0].precio;
            
            totalFinal += (numPaquetes * promo.precioPaquete) + (sobrantes * precioUnitario);
        } else {
            // Sin promo
            totalFinal += grupo.items.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
        }
    });

    return totalFinal;
};
