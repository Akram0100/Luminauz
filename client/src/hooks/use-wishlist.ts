import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

interface WishlistState {
    items: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    clearWishlist: () => void;
}

export const useWishlist = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addToWishlist: (product) => {
                const { items } = get();
                if (!items.some(item => item.id === product.id)) {
                    set({ items: [...items, product] });
                }
            },

            removeFromWishlist: (productId) => {
                set({ items: get().items.filter(item => item.id !== productId) });
            },

            isInWishlist: (productId) => {
                return get().items.some(item => item.id === productId);
            },

            clearWishlist: () => {
                set({ items: [] });
            },
        }),
        {
            name: 'lumina-wishlist',
        }
    )
);
