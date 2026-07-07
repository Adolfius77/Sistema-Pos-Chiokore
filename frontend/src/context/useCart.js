import { useContext } from "react";
import { CartContext } from "./cartContext.js";

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart debe usarse dentro de CartProvider");
    }
    return context;
};
