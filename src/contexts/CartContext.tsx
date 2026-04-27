import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/js/utils/supabaseClient";
import { addToCart, getCartItems, removeFromCart } from "@/js/services/cart";

export interface CartItem {
  id: string;
  outfitId: string;
  name: string;
  image: string;
  size: string;
  duration: number;
  price: number;
  deposit: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (outfitId: string, size: string, duration: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  getTotal: () => { rental: number; deposit: number; delivery: number; grand: number };
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCartItems();
      const mappedItems: CartItem[] = (data || []).map((row: any) => ({
        id: row.id,
        outfitId: row.outfits?.id || "",
        name: row.outfits?.name || "Unknown",
        image: row.outfits?.image_url || "",
        size: row.size,
        duration: row.rental_days,
        price: (row.outfits?.price_per_day || 0) * row.rental_days,
        deposit: Math.round((row.outfits?.price_per_day || 0) * row.rental_days * 0.5),
      }));
      setItems(mappedItems);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for auth state changes to sync cart
  useEffect(() => {
    // Initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchCart();
      } else {
        setItems([]);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchCart();
        } else {
          setItems([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchCart]);

  const addItemToCart = async (outfitId: string, size: string, duration: number) => {
    await addToCart(outfitId, size, duration);
    await fetchCart(); // Refresh to get full joined data
  };

  const removeItemFromCart = async (cartItemId: string) => {
    await removeFromCart(cartItemId);
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  const getTotal = () => {
    const rental = items.reduce((sum, item) => sum + item.price, 0);
    const deposit = items.reduce((sum, item) => sum + item.deposit, 0);
    const delivery = 0; // Free delivery
    const grand = rental + deposit + delivery;
    return { rental, deposit, delivery, grand };
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem: addItemToCart,
        removeItem: removeItemFromCart,
        clearCart,
        refreshCart,
        getTotal,
        itemCount: items.length,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
