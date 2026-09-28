<script setup>
import { RouterLink } from "vue-router";
import { useCartStore } from "../stores/cart";

const cart = useCartStore();

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString();
};

const updateQuantity = (item, event) => {
  const value = Number(event.target.value);

  if (!Number.isFinite(value)) return;

  cart.updateQuantity(item, value);
};
</script>

<template>
  <main class="cart-page">
    <!-- EMPTY BAG -->
    <section
      v-if="!cart.items.length"
      class="container empty-cart"
    >
      <p class="empty-number">05</p>

      <p class="eyebrow">
        Threads · Your bag
      </p>

      <h1>
        Nothing here
        <em>yet.</em>
      </h1>

      <p class="empty-copy">
        Your favourites are waiting for you.
        Take another look through the collection.
      </p>

      <RouterLink
        to="/shop"
        class="btn btn-primary"
      >
        Explore the collection
      </RouterLink>
    </section>

    <!-- CART -->
    <section
      v-else
      class="container"
    >
      <!-- HEADER -->
      <header class="cart-header">
        <div>
          <p class="eyebrow">
            Threads · Your bag
          </p>

          <h1>Your bag</h1>
        </div>

        <p class="item-count">
          {{ cart.count }}
          {{ cart.count === 1 ? "item" : "items" }}
        </p>
      </header>

      <div class="cart-layout">
        <!-- ITEMS -->
        <div class="lines">
          <div
            v-for="item in cart.items"
            :key="`${item.productId}-${item.size}-${item.color}`"
            class="line"
          >
            <!-- IMAGE -->
            <RouterLink
              :to="`/product/${item.productId}`"
              class="line-image-wrap"
            >
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                class="line-image"
              />

              <div
                v-else
                class="line-image placeholder"
              >
                Threads
              </div>
            </RouterLink>

            <!-- INFO -->
            <div class="line-info">
              <RouterLink
                :to="`/product/${item.productId}`"
                class="line-name"
              >
                {{ item.name }}
              </RouterLink>

              <p
                v-if="item.size || item.color"
                class="line-meta"
              >
                <span v-if="item.size">
                  Size {{ item.size }}
                </span>

                <span v-if="item.size && item.color">
                  ·
                </span>

                <span v-if="item.color">
                  {{ item.color }}
                </span>
              </p>

              <p class="line-price">
                Rs {{ formatPrice(item.price) }}
              </p>
            </div>

            <!-- QUANTITY -->
            <div class="quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                :disabled="item.quantity <= 1"
                @click="
                  cart.updateQuantity(
                    item,
                    item.quantity - 1
                  )
                "
              >
                −
              </button>

              <input
                type="number"
                min="1"
                :max="item.stockAvailable || 99"
                :value="item.quantity"
                :aria-label="`Quantity of ${item.name}`"
                @change="updateQuantity(item, $event)"
              />

              <button
                type="button"
                aria-label="Increase quantity"
                :disabled="
                  item.quantity >=
                  (item.stockAvailable || 99)
                "
                @click="
                  cart.updateQuantity(
                    item,
                    item.quantity + 1
                  )
                "
              >
                +
              </button>
            </div>

            <!-- TOTAL -->
            <p class="line-total">
              Rs
              {{
                formatPrice(
                  item.price * item.quantity
                )
              }}
            </p>

            <!-- REMOVE -->
            <button
              type="button"
              class="remove"
              @click="cart.removeItem(item)"
            >
              Remove
            </button>
          </div>

          <RouterLink
            to="/shop"
            class="continue"
          >
            <span>←</span>
            Continue shopping
          </RouterLink>
        </div>

        <!-- SUMMARY -->
        <aside class="summary">
          <div class="summary-inner">
            <p class="summary-kicker">
              Order summary
            </p>

            <div class="summary-row">
              <span>Subtotal</span>

              <span>
                Rs {{ formatPrice(cart.subtotal) }}
              </span>
            </div>

            <div class="summary-row muted">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-total">
              <span>Total</span>

              <span>
                Rs {{ formatPrice(cart.subtotal) }}
              </span>
            </div>

            <RouterLink
              to="/checkout"
              class="checkout-button"
            >
              <span>Continue to checkout</span>
              <span>→</span>
            </RouterLink>

            <div class="payment-note">
              <span class="note-icon">✓</span>

              <p>
                Cash on delivery and secure card
                payment available.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* =========================================
   PAGE
   ========================================= */

.cart-page {
  min-height: 70vh;
  padding-top: 55px;
  padding-bottom: 140px;
}

/* =========================================
   HEADER
   ========================================= */

.cart-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  padding-bottom: 38px;

  border-bottom: 1px solid var(--color-line);
}

.eyebrow {
  margin-bottom: 17px;

  color: var(--color-accent);

  font-size: 0.68rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.cart-header h1 {
  margin: 0;

  font-size: clamp(3.5rem, 7vw, 6rem);
  letter-spacing: -0.05em;
  line-height: 0.9;
}

.item-count {
  margin: 0 0 5px;

  color: var(--color-ink-soft);

  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* =========================================
   LAYOUT
   ========================================= */

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.75fr);
  gap: clamp(45px, 7vw, 100px);

  padding-top: 25px;
}

/* =========================================
   ITEMS
   ========================================= */

.lines {
  min-width: 0;
}

.line {
  display: grid;
  grid-template-columns:
    110px
    minmax(150px, 1fr)
    auto
    auto
    auto;

  align-items: center;

  gap: 22px;

  padding: 25px 0;

  border-bottom: 1px solid var(--color-line);
}

.line-image-wrap {
  display: block;

  overflow: hidden;

  background: var(--color-paper-alt);
}

.line-image {
  width: 110px;
  height: 138px;

  object-fit: cover;

  transition: transform 350ms ease;
}

.line-image-wrap:hover .line-image {
  transform: scale(1.025);
}

.line-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-ink-soft);

  font-family: var(--font-display);
  font-size: 0.85rem;
}

/* =========================================
   ITEM INFO
   ========================================= */

.line-info {
  min-width: 0;
}

.line-name {
  display: inline-block;

  margin-bottom: 7px;

  font-family: var(--font-display);
  font-size: 1.25rem;
  line-height: 1.1;
}

.line-name:hover {
  color: var(--color-accent);
}

.line-meta {
  margin-bottom: 8px;

  color: var(--color-ink-soft);

  font-size: 0.72rem;
}

.line-price {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.78rem;
}

/* =========================================
   QUANTITY
   ========================================= */

.quantity {
  display: flex;
  align-items: center;

  height: 38px;

  border: 1px solid var(--color-line);
}

.quantity button {
  width: 34px;
  height: 100%;

  padding: 0;

  border: 0;
  background: transparent;

  color: var(--color-ink);

  font-size: 1rem;

  cursor: pointer;
}

.quantity button:hover:not(:disabled) {
  background: var(--color-paper-alt);
}

.quantity button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quantity input {
  width: 34px;
  height: 100%;

  padding: 0;

  border: 0;

  background: transparent;

  color: var(--color-ink);

  font-family: var(--font-body);
  font-size: 0.75rem;

  text-align: center;

  outline: none;
}

/* Hide browser number arrows */

.quantity input::-webkit-outer-spin-button,
.quantity input::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}

.quantity input[type="number"] {
  appearance: textfield;
}

/* =========================================
   TOTAL + REMOVE
   ========================================= */

.line-total {
  min-width: 90px;

  margin: 0;

  font-family: var(--font-display);
  font-size: 1.05rem;

  text-align: right;
}

.remove {
  padding: 4px 0;

  border: 0;
  border-bottom: 1px solid transparent;

  background: transparent;

  color: var(--color-ink-soft);

  font-family: var(--font-body);
  font-size: 0.68rem;

  cursor: pointer;
}

.remove:hover {
  border-bottom-color: var(--color-error);
  color: var(--color-error);
}

/* =========================================
   CONTINUE
   ========================================= */

.continue {
  display: inline-flex;
  align-items: center;
  gap: 10px;

  margin-top: 28px;

  color: var(--color-ink-soft);

  font-size: 0.72rem;

  text-transform: uppercase;
  letter-spacing: 0.09em;

  transition: color 180ms ease;
}

.continue:hover {
  color: var(--color-accent);
}

.continue span {
  font-size: 1rem;
}

/* =========================================
   SUMMARY
   ========================================= */

.summary {
  position: relative;
}

.summary-inner {
  position: sticky;
  top: 105px;

  padding: 28px;

  border: 1px solid var(--color-line);

  background: var(--color-white);
}

.summary-kicker {
  margin-bottom: 25px;

  color: var(--color-accent);

  font-size: 0.68rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 16px;

  font-size: 0.82rem;
}

.summary-row.muted {
  color: var(--color-ink-soft);

  font-size: 0.72rem;
}

.summary-row.muted span:last-child {
  max-width: 150px;

  text-align: right;
}

.summary-divider {
  height: 1px;

  margin: 24px 0;

  background: var(--color-line);
}

.summary-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  margin-bottom: 25px;

  font-family: var(--font-display);
  font-size: 1.3rem;
}

.checkout-button {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 17px 18px;

  border: 1px solid var(--color-accent);

  background: var(--color-accent);
  color: var(--color-white);

  font-size: 0.72rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.08em;

  transition:
    background 180ms ease,
    border-color 180ms ease;
}

.checkout-button:hover {
  background: #24305e;
  border-color: #24305e;
}

.checkout-button span:last-child {
  font-size: 1rem;
}

.payment-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;

  margin-top: 20px;

  color: var(--color-ink-soft);

  font-size: 0.68rem;
  line-height: 1.45;
}

.payment-note p {
  margin: 0;
}

.note-icon {
  flex-shrink: 0;

  width: 16px;
  height: 16px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: var(--color-paper-alt);

  color: var(--color-accent);

  font-size: 0.6rem;
}

/* =========================================
   EMPTY CART
   ========================================= */

.empty-cart {
  min-height: 650px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
}

.empty-number {
  margin-bottom: 10px;

  color: var(--color-accent-soft);

  font-family: var(--font-display);
  font-size: 4rem;
  line-height: 1;
}

.empty-cart h1 {
  margin-bottom: 22px;

  font-size: clamp(3.5rem, 7vw, 6rem);
  letter-spacing: -0.05em;
  line-height: 0.9;
}

.empty-cart h1 em {
  display: block;
  font-weight: 400;
}

.empty-copy {
  max-width: 420px;

  margin-bottom: 30px;

  color: var(--color-ink-soft);
}

/* =========================================
   RESPONSIVE
   ========================================= */

@media (max-width: 1000px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .summary-inner {
    position: static;
  }

  .line {
    grid-template-columns:
      90px
      minmax(150px, 1fr)
      auto
      auto;
  }

  .line-image {
    width: 90px;
    height: 115px;
  }

  .remove {
    grid-column: 2 / -1;
    justify-self: start;
  }
}

@media (max-width: 650px) {
  .cart-page {
    padding-top: 35px;
    padding-bottom: 90px;
  }

  .cart-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 15px;
  }

  .cart-header h1 {
    font-size: 4rem;
  }

  .cart-layout {
    padding-top: 5px;
  }

  .line {
    grid-template-columns: 78px 1fr;
    grid-template-areas:
      "image info"
      "image quantity"
      "image total"
      "image remove";

    align-items: start;

    gap: 8px 14px;

    padding: 22px 0;
  }

  .line-image-wrap {
    grid-area: image;
  }

  .line-image {
    width: 78px;
    height: 105px;
  }

  .line-info {
    grid-area: info;
  }

  .quantity {
    grid-area: quantity;

    justify-self: start;
  }

  .line-total {
    grid-area: total;

    min-width: 0;

    text-align: left;
  }

  .remove {
    grid-area: remove;

    justify-self: start;
  }

  .line-name {
    font-size: 1.05rem;
  }

  .summary-inner {
    padding: 22px;
  }
}
</style>

