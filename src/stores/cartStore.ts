import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;
const CART_CREATE = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } } userErrors { field message } } }`;
const CART_ADD = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } } userErrors { field message } } }`;
const CART_UPDATE = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } } }`;
const CART_REMOVE = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } } }`;

function formatCheckoutUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("channel", "online_store");
    return u.toString();
  } catch { return url; }
}

function isCartNotFound(errs: Array<{ message: string }>): boolean {
  return errs.some(e => e.message.toLowerCase().includes("cart not found") || e.message.toLowerCase().includes("does not exist"));
}

async function createShopifyCart(item: CartItem) {
  const data = await storefrontApiRequest(CART_CREATE, { input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] } });
  if (data?.data?.cartCreate?.userErrors?.length > 0) { console.error(data.data.cartCreate.userErrors); return null; }
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;
  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

async function addLine(cartId: string, item: CartItem) {
  const data = await storefrontApiRequest(CART_ADD, { cartId, lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] });
  const errs = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) { console.error(errs); return { success: false }; }
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id };
}

async function updateLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_UPDATE, { cartId, lines: [{ id: lineId, quantity }] });
  const errs = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) return { success: false };
  return { success: true };
}

async function removeLine(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_REMOVE, { cartId, lineIds: [lineId] });
  const errs = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) return { success: false };
  return { success: true };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [], cartId: null, checkoutUrl: null, isLoading: false, isSyncing: false,

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existing = items.find(i => i.variantId === item.variantId);
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ ...item, lineId: null });
            if (result) set({ cartId: result.cartId, checkoutUrl: result.checkoutUrl, items: [{ ...item, lineId: result.lineId }] });
          } else if (existing) {
            const newQty = existing.quantity + item.quantity;
            if (!existing.lineId) return;
            const r = await updateLine(cartId, existing.lineId, newQty);
            if (r.success) set({ items: get().items.map(i => i.variantId === item.variantId ? { ...i, quantity: newQty } : i) });
            else if (r.cartNotFound) clearCart();
          } else {
            const r = await addLine(cartId, { ...item, lineId: null });
            if (r.success) set({ items: [...get().items, { ...item, lineId: r.lineId ?? null }] });
            else if (r.cartNotFound) clearCart();
          }
        } finally { set({ isLoading: false }); }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const r = await updateLine(cartId, item.lineId, quantity);
          if (r.success) set({ items: get().items.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
          else if (r.cartNotFound) clearCart();
        } finally { set({ isLoading: false }); }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const r = await removeLine(cartId, item.lineId);
          if (r.success) {
            const newItems = get().items.filter(i => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (r.cartNotFound) clearCart();
        } finally { set({ isLoading: false }); }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
        } finally { set({ isSyncing: false }); }
      },
    }),
    {
      name: "yumi-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, cartId: s.cartId, checkoutUrl: s.checkoutUrl }),
    }
  )
);
