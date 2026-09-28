import { defineStore } from "pinia";

// A cart line is unique per product + size + color combination
const lineKey = (item) => `${item.productId}__${item.size || ""}__${item.color || ""}`;

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [], // { productId, name, image, price, size, color, quantity, stockAvailable }
  }),
  getters: {
    count: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: (state) => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  },
  actions: {
    addItem(item) {
      const key = lineKey(item);
      const existing = this.items.find((i) => lineKey(i) === key);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + item.quantity, item.stockAvailable ?? 999);
      } else {
        this.items.push(item);
      }
    },
    updateQuantity(item, quantity) {
      const existing = this.items.find((i) => lineKey(i) === lineKey(item));
      if (!existing) return;
      existing.quantity = Math.max(1, Math.min(quantity, existing.stockAvailable ?? 999));
    },
    removeItem(item) {
      this.items = this.items.filter((i) => lineKey(i) !== lineKey(item));
    },
    clear() {
      this.items = [];
    },
  },
  persist: true,
});
