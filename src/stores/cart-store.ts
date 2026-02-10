import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId?: string;
  productName: string;
  productImage?: string;
  foamOptionId?: string;
  foamOptionName?: string;
  uploadId?: string;
  isCustomCut: boolean;
  quantity: number;
  unitPrice: number; // in cents
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = `${item.productId || "custom"}-${item.foamOptionId || "none"}-${item.uploadId || "none"}-${Date.now()}`;

        set((state) => {
          // Check if similar item exists (same product + foam option + upload)
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.foamOptionId === item.foamOptionId &&
              i.uploadId === item.uploadId
          );

          if (existingIndex >= 0 && !item.isCustomCut) {
            // Update quantity for non-custom items
            const newItems = [...state.items];
            newItems[existingIndex].quantity += item.quantity;
            return { items: newItems };
          }

          // Add new item
          return { items: [...state.items, { ...item, id }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.unitPrice * item.quantity,
          0
        );
      },

      getTotal: () => {
        // For now, just subtotal. Can add tax/shipping logic later
        return get().getSubtotal();
      },
    }),
    {
      name: "cutmycase-cart",
    }
  )
);
