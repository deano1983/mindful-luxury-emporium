import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShopifyProduct } from "@/lib/shopify";

/**
 * STANDALONE CART (Yu+Mi) — no Shopify cart API.
 * Items live in localStorage; checkout is a POST to our own Netlify function
 * (/api/create-checkout-session) which validates prices server-side from
 * netlify/functions/data/yumi-prices.json and creates a direct Stripe
 * Checkout Session (no Lovable gateway, no Shopify).
 */

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface NdisAttributes {
  participantName: string;
  ndisNumber: string;
  email: string;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  ndis: NdisAttributes | null;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  setNdisAttributes: (attributes: Array<{ key: string; value: string }>) => Promise<void>;
  startCheckout: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [], cartId: null, checkoutUrl: null, isLoading: false, isSyncing: false, ndis: null,

      addItem: async (item) => {
        const { items } = get();
        const existing = items.find(i => i.variantId === item.variantId);
        if (existing) {
          set({ items: items.map(i => i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i) });
        } else {
          set({ items: [...items, { ...item, lineId: null }] });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        set({ items: get().items.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
      },

      removeItem: async (variantId) => {
        set({ items: get().items.filter(i => i.variantId !== variantId) });
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      setNdisAttributes: async (attributes) => {
        // Standalone: participant details are sent with the checkout POST instead.
        const map: Record<string, string> = {};
        for (const a of attributes) map[a.key] = a.value;
        set({ ndis: { participantName: map["Participant Name"] ?? map["participantName"] ?? "", ndisNumber: map["NDIS Number"] ?? map["ndisNumber"] ?? "", email: map["Email"] ?? map["email"] ?? "" } });
      },

      syncCart: async () => { /* local cart — nothing to sync remotely */ },

      startCheckout: async () => {
        const { items, ndis } = get();
        if (items.length === 0) return;
        try {
          const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lines: items.map(i => ({ handle: i.product.node.handle, variantId: i.variantId, quantity: i.quantity })),
              ndis: ndis && ndis.participantName ? ndis : undefined,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "Checkout failed");
          if (data.url) window.location.assign(data.url);
        } catch (err) {
          console.error("checkout failed:", err);
          alert(err instanceof Error ? err.message : "Checkout is unavailable right now.");
        }
      },
    }),
    {
      name: "yumi-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, ndis: s.ndis }),
    },
  ),
);
