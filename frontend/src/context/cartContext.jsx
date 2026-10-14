import { useState } from "react";
import { CartContext } from "./cartContext.js";
import { calcularTotalConPromociones } from "../utils/cartCalculations.js";

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (producto) => {
        setCartItems((prev) => {
            const existe = prev.find((item) => item.id === producto.id);
            if (existe) {
                return prev.map((item) =>
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const updateQuantity = (id, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;
        setCartItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, cantidad: nuevaCantidad } : item))
        );
    };

    const eliminarCarrito = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = () => setCartItems([]);

    //metodo para obtener el total del carrito con promociones aplicadas
    const getTotal = () => calcularTotalConPromociones(cartItems);

    const value = { cartItems, addToCart, updateQuantity, getTotal, eliminarCarrito, clearCart };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};