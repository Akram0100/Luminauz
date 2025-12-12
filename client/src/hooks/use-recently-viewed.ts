import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedItem {
    productId: number;
    slug: string;
    title: string;
    imageUrl: string;
    price: number;
    viewedAt: number;
}

interface RecentlyViewedState {
    items: RecentlyViewedItem[];
    addItem: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
    getItems: () => RecentlyViewedItem[];
    clearItems: () => void;
}

const MAX_ITEMS = 10;

export const useRecentlyViewed = create<RecentlyViewedState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const { items } = get();
                // Remove existing entry if present
                const filteredItems = items.filter(i => i.productId !== item.productId);
                // Add new item at the beginning
                const newItems = [
                    { ...item, viewedAt: Date.now() },
                    ...filteredItems,
                ].slice(0, MAX_ITEMS); // Keep only last 10
                set({ items: newItems });
            },

            getItems: () => {
                return get().items;
            },

            clearItems: () => {
                set({ items: [] });
            },
        }),
        {
            name: 'lumina-recently-viewed',
        }
    )
);
