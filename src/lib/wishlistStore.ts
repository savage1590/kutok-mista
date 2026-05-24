import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './types';

interface WishlistState {
  items: Product[];
  toggleItem: (product: Product) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggleItem: (product) => {
        set((state) => {
          const exists = state.items.some(i => i.id === product.id);
          if (exists) {
            return { items: state.items.filter(i => i.id !== product.id) };
          }
          return { items: [...state.items, product] };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(i => i.id !== id)
        }));
      },
      
      isInWishlist: (id) => {
        return get().items.some(i => i.id === id);
      },
      
      clearWishlist: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.length;
      }
    }),
    {
      name: 'kutok-mista-wishlist',
    }
  )
);
