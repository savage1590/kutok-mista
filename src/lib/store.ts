import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './types';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedProperties?: Record<string, string>;
  id: string; // Unique ID for cart item (product.id + selections)
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, selectedProperties?: Record<string, string>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity, selectedProperties) => {
        // Create a unique ID string based on sorted properties so identical selections match
        const propsString = selectedProperties ? Object.entries(selectedProperties).sort((a,b) => a[0].localeCompare(b[0])).map(([k,v]) => `${k}:${v}`).join('|') : 'none';
        const itemId = `${product.id}-${propsString}`;
        
        set((state) => {
          const existingItemIndex = state.items.findIndex(i => i.id === itemId);
          
          if (existingItemIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          }
          
          return {
            items: [...state.items, { product, quantity, selectedProperties, id: itemId }]
          };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(i => i.id !== id)
        }));
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      }
    }),
    {
      name: 'kutok-mista-cart',
    }
  )
);
