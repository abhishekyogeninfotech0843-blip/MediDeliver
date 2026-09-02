import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("medideliver_cart");

      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Cart loading error:", error);
      return [];
    }
  });

  // ==============================
  // SAVE CART
  // ==============================

  useEffect(() => {
    localStorage.setItem("medideliver_cart", JSON.stringify(cart));
  }, [cart]);

  // ==============================
  // ADD TO CART
  // ==============================

  const addToCart = (medicine) => {
    setCart((currentCart) => {
      const existingMedicine = currentCart.find(
        (item) => item._id === medicine._id,
      );

      if (existingMedicine) {
        return currentCart.map((item) =>
          item._id === medicine._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          ...medicine,
          quantity: 1,
        },
      ];
    });
  };

  // ==============================
  // REMOVE FROM CART
  // ==============================

  const removeFromCart = (medicineId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item._id !== medicineId),
    );
  };

  // ==============================
  // INCREASE QUANTITY
  // ==============================

  const increaseQuantity = (medicineId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === medicineId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  // ==============================
  // DECREASE QUANTITY
  // ==============================

  const decreaseQuantity = (medicineId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === medicineId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // ==============================
  // UPDATE QUANTITY DIRECTLY
  // ==============================

  const updateQuantity = (medicineId, newQuantity) => {
    const parsedQty = parseInt(newQuantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return;
    }
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === medicineId
          ? {
              ...item,
              quantity: Math.min(Math.max(1, parsedQty), 999),
            }
          : item,
      ),
    );
  };

  // ==============================
  // CLEAR CART
  // ==============================

  const clearCart = () => {
    setCart([]);
  };

  // ==============================
  // CART COUNT
  // ==============================

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // ==============================
  // CART TOTAL
  // ==============================

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.sellingPrice || 0) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ==============================
// USE CART HOOK
// ==============================

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
