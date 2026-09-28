<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter, RouterLink } from "vue-router";
import api from "../api/axios";
import { useCartStore } from "../stores/cart";

const cart = useCartStore();
const router = useRouter();

const form = reactive({
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
});

const submitting = ref(false);
const errorMsg = ref("");

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_FEE = 200;

/*
 * Free shipping when subtotal is Rs 5,000 or more.
 * Otherwise shipping is Rs 200.
 */
const shippingFee = computed(() => {
  return cart.subtotal >= SHIPPING_THRESHOLD
    ? 0
    : SHIPPING_FEE;
});

const orderTotal = computed(() => {
  return cart.subtotal + shippingFee.value;
});

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString();
};

const buildPayload = () => ({
  items: cart.items.map((i) => ({
    productId: i.productId,
    size: i.size,
    color: i.color,
    quantity: i.quantity,
  })),

  customer: {
    ...form,
  },
});

const placeOrder = async () => {
  errorMsg.value = "";
  submitting.value = true;

  try {
    const { data } = await api.post(
      "/orders/cod",
      buildPayload()
    );

    cart.clear();

    router.push({
      path: "/order-success",
      query: {
        order: data.order.orderNumber,
      },
    });
  } catch (err) {
    errorMsg.value =
      err.response?.data?.message ||
      err.message ||
      "Something went wrong placing the order.";
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <main class="checkout-page">
    <section class="container">

      <!-- HEADER -->
      <header class="checkout-header">
        <div>
          <p class="eyebrow">
            Threads · Checkout
          </p>

          <h1>Almost yours.</h1>

          <p class="header-copy">
            A few details and we'll get your order
            on its way.
          </p>
        </div>

        <RouterLink
          to="/cart"
          class="back-link"
        >
          ← Back to bag
        </RouterLink>
      </header>


      <!-- EMPTY -->
      <div
        v-if="!cart.items.length"
        class="empty panel"
      >
        <p class="eyebrow">
          Nothing to checkout
        </p>

        <h2>Your bag is empty.</h2>

        <RouterLink
          to="/shop"
          class="btn btn-primary"
        >
          Browse the collection
        </RouterLink>
      </div>


      <!-- CHECKOUT -->
      <div
        v-else
        class="checkout-layout"
      >

        <!-- LEFT -->
        <form
          class="checkout-form"
          @submit.prevent="placeOrder"
        >

          <!-- DELIVERY -->
          <section class="form-section">
            <div class="section-heading">
              <span class="section-number">
                01
              </span>

              <div>
                <h2>Delivery details</h2>

                <p>
                  Where should we send your order?
                </p>
              </div>
            </div>


            <div class="field">
              <label for="name">
                Full name
              </label>

              <input
                id="name"
                v-model="form.name"
                autocomplete="name"
                placeholder="Your full name"
                required
              />
            </div>


            <div class="field-row">

              <div class="field">
                <label for="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  autocomplete="tel"
                  placeholder="03XX XXXXXXX"
                  required
                />
              </div>


              <div class="field">
                <label for="email">
                  Email
                  <span>(optional)</span>
                </label>

                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                />
              </div>

            </div>


            <div class="field">
              <label for="address">
                Delivery address
              </label>

              <textarea
                id="address"
                v-model="form.address"
                rows="3"
                autocomplete="street-address"
                placeholder="House / flat number, street, area..."
                required
              ></textarea>
            </div>


            <div class="field">
              <label for="city">
                City
              </label>

              <input
                id="city"
                v-model="form.city"
                autocomplete="address-level2"
                placeholder="Rawalpindi"
                required
              />
            </div>

          </section>


          <!-- PAYMENT -->
          <section class="form-section payment-section">

            <div class="section-heading">

              <span class="section-number">
                02
              </span>

              <div>
                <h2>Payment</h2>

                <p>
                  Pay when your order arrives.
                </p>
              </div>

            </div>


            <div class="payment-options">

              <div
                class="payment-option selected"
              >

                <span class="radio"></span>

                <span class="payment-copy">

                  <strong>
                    Cash on delivery
                  </strong>

                  <small>
                    Pay when your order arrives
                  </small>

                </span>

                <span class="payment-mark">
                  COD
                </span>

              </div>

            </div>

          </section>


          <!-- ERROR -->
          <div
            v-if="errorMsg"
            class="error-box"
          >
            <strong>
              We couldn't place the order.
            </strong>

            <p>
              {{ errorMsg }}
            </p>
          </div>


          <!-- SUBMIT -->
          <button
            class="place-order"
            :disabled="submitting"
            type="submit"
          >

            <span>
              {{
                submitting
                  ? "Processing..."
                  : "Place order"
              }}
            </span>

            <span>
              {{
                submitting
                  ? "..."
                  : "→"
              }}
            </span>

          </button>


          <p class="secure-note">
            <span>✓</span>

            Your order details are sent securely.
          </p>

        </form>


        <!-- RIGHT -->
        <aside class="order-summary">

          <div class="summary-inner">

            <div class="summary-heading">

              <div>

                <p class="summary-kicker">
                  Your order
                </p>

                <h2>
                  {{ cart.count }}
                  {{ cart.count === 1 ? "item" : "items" }}
                </h2>

              </div>


              <RouterLink
                to="/cart"
                class="edit-link"
              >
                Edit
              </RouterLink>

            </div>


            <!-- ITEMS -->
            <div class="summary-items">

              <div
                v-for="item in cart.items"
                :key="`${item.productId}-${item.size}-${item.color}`"
                class="summary-item"
              >

                <div class="summary-image-wrap">

                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name"
                  />

                  <div
                    v-else
                    class="summary-placeholder"
                  >
                    T
                  </div>

                  <span class="quantity-badge">
                    {{ item.quantity }}
                  </span>

                </div>


                <div class="summary-item-info">

                  <p class="summary-item-name">
                    {{ item.name }}
                  </p>


                  <p
                    v-if="item.size || item.color"
                    class="summary-item-meta"
                  >

                    <span v-if="item.size">
                      {{ item.size }}
                    </span>

                    <span
                      v-if="
                        item.size &&
                        item.color
                      "
                    >
                      ·
                    </span>

                    <span v-if="item.color">
                      {{ item.color }}
                    </span>

                  </p>

                </div>


                <p class="summary-item-price">

                  Rs
                  {{
                    formatPrice(
                      item.price *
                      item.quantity
                    )
                  }}

                </p>

              </div>

            </div>


            <div class="summary-divider"></div>


            <!-- SUBTOTAL -->
            <div class="price-row">

              <span>
                Subtotal
              </span>

              <span>
                Rs
                {{ formatPrice(cart.subtotal) }}
              </span>

            </div>


            <!-- SHIPPING -->
            <div class="price-row muted">

              <span>
                Shipping
              </span>

              <span v-if="shippingFee === 0">
                Free
              </span>

              <span v-else>
                Rs
                {{ formatPrice(shippingFee) }}
              </span>

            </div>


            <div class="summary-divider"></div>


            <!-- TOTAL -->
            <div class="total-row">

              <span>
                Total
              </span>

              <span>
                Rs
                {{ formatPrice(orderTotal) }}
              </span>

            </div>


            <!-- DELIVERY NOTE -->
            <div class="delivery-note">

              <span class="note-icon">
                ✓
              </span>

              <div>

                <strong>
                  Simple, local delivery
                </strong>

                <p v-if="shippingFee === 0">
                  You've unlocked free shipping!
                </p>

                <p v-else>
                  Free shipping on orders over
                  Rs 5,000.
                </p>

              </div>

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

.checkout-page {
  min-height: 75vh;
  padding: 55px 0 120px;
}


/* =========================================
   HEADER
   ========================================= */

.checkout-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  padding-bottom: 38px;

  border-bottom: 1px solid var(--color-line);
}

.eyebrow {
  margin-bottom: 16px;

  color: var(--color-accent);

  font-size: 0.68rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.checkout-header h1 {
  margin: 0;

  font-size: clamp(3.4rem, 7vw, 5.7rem);

  letter-spacing: -0.055em;
  line-height: 0.9;
}

.header-copy {
  margin: 22px 0 0;

  max-width: 420px;

  color: var(--color-ink-soft);

  font-size: 0.9rem;
}

.back-link {
  margin-bottom: 6px;

  color: var(--color-ink-soft);

  font-size: 0.7rem;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.back-link:hover {
  color: var(--color-accent);
}


/* =========================================
   LAYOUT
   ========================================= */

.checkout-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1.25fr)
    minmax(320px, 0.75fr);

  gap: clamp(45px, 7vw, 100px);

  padding-top: 38px;
}


/* =========================================
   FORM
   ========================================= */

.checkout-form {
  min-width: 0;
}

.form-section {
  padding-bottom: 38px;

  border-bottom: 1px solid var(--color-line);
}

.payment-section {
  padding-top: 38px;
}

.section-heading {
  display: flex;

  gap: 18px;

  margin-bottom: 28px;
}

.section-number {
  padding-top: 4px;

  color: var(--color-accent-soft);

  font-family: var(--font-display);
  font-size: 0.9rem;
}

.section-heading h2 {
  margin: 0 0 5px;

  font-size: 1.55rem;
}

.section-heading p {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.76rem;
}


/* =========================================
   PAYMENT
   ========================================= */

.payment-options {
  display: flex;
  flex-direction: column;

  gap: 10px;
}

.payment-option {
  position: relative;

  display: flex;
  align-items: center;

  gap: 14px;

  padding: 17px;

  border: 1px solid var(--color-line);

  background: transparent;

  cursor: default;
}

.payment-option.selected {
  border-color: var(--color-accent);

  background: var(--color-white);
}

.radio {
  flex-shrink: 0;

  width: 18px;
  height: 18px;

  border: 5px solid var(--color-accent);
  border-radius: 50%;

  background: var(--color-paper);
}

.payment-copy {
  display: flex;
  flex-direction: column;

  gap: 3px;

  flex: 1;
}

.payment-copy strong {
  font-size: 0.85rem;
  font-weight: 500;
}

.payment-copy small {
  color: var(--color-ink-soft);

  font-size: 0.68rem;
}

.payment-mark {
  color: var(--color-ink-soft);

  font-size: 0.58rem;
  letter-spacing: 0.08em;
}


/* =========================================
   ERROR
   ========================================= */

.error-box {
  margin-top: 25px;
  padding: 15px 17px;

  border: 1px solid var(--color-error);

  background: rgba(166, 61, 47, 0.04);

  color: var(--color-error);
}

.error-box strong {
  display: block;

  margin-bottom: 4px;

  font-size: 0.78rem;
}

.error-box p {
  margin: 0;

  font-size: 0.75rem;
}


/* =========================================
   SUBMIT
   ========================================= */

.place-order {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 28px;
  padding: 18px 20px;

  border: 1px solid var(--color-accent);

  background: var(--color-accent);
  color: var(--color-white);

  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.09em;

  cursor: pointer;

  transition:
    background 180ms ease,
    border-color 180ms ease;
}

.place-order:hover:not(:disabled) {
  background: #24305e;
  border-color: #24305e;
}

.place-order:disabled {
  opacity: 0.55;
  cursor: wait;
}

.place-order span:last-child {
  font-size: 1rem;
}

.secure-note {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  margin: 13px 0 0;

  color: var(--color-ink-soft);

  font-size: 0.65rem;
}

.secure-note span {
  color: var(--color-accent);
}


/* =========================================
   ORDER SUMMARY
   ========================================= */

.order-summary {
  position: relative;
}

.summary-inner {
  position: sticky;
  top: 105px;

  padding: 27px;

  border: 1px solid var(--color-line);

  background: var(--color-white);
}

.summary-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  margin-bottom: 25px;
}

.summary-kicker {
  margin: 0 0 5px;

  color: var(--color-accent);

  font-size: 0.62rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.summary-heading h2 {
  margin: 0;

  font-size: 1.3rem;
}

.edit-link {
  color: var(--color-ink-soft);

  font-size: 0.65rem;

  text-decoration: underline;
  text-underline-offset: 3px;
}

.edit-link:hover {
  color: var(--color-accent);
}


/* =========================================
   SUMMARY ITEMS
   ========================================= */

.summary-items {
  display: flex;
  flex-direction: column;

  gap: 18px;
}

.summary-item {
  display: grid;

  grid-template-columns: 58px 1fr auto;

  align-items: center;

  gap: 12px;
}

.summary-image-wrap {
  position: relative;

  width: 58px;
  height: 72px;

  background: var(--color-paper-alt);

  overflow: visible;
}

.summary-image-wrap img {
  width: 100%;
  height: 100%;

  object-fit: cover;
}

.summary-placeholder {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-ink-soft);

  font-family: var(--font-display);
}

.quantity-badge {
  position: absolute;

  top: -7px;
  right: -7px;

  min-width: 19px;
  height: 19px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 5px;

  border-radius: 50%;

  background: var(--color-accent);
  color: var(--color-white);

  font-size: 0.58rem;
}

.summary-item-info {
  min-width: 0;
}

.summary-item-name {
  overflow: hidden;

  margin: 0 0 5px;

  font-family: var(--font-display);
  font-size: 0.9rem;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-item-meta {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.65rem;
}

.summary-item-price {
  margin: 0;

  font-family: var(--font-display);
  font-size: 0.82rem;

  white-space: nowrap;
}


/* =========================================
   PRICES
   ========================================= */

.summary-divider {
  height: 1px;

  margin: 24px 0;

  background: var(--color-line);
}

.price-row {
  display: flex;
  justify-content: space-between;

  margin-bottom: 13px;

  font-size: 0.78rem;
}

.price-row.muted {
  color: var(--color-ink-soft);
}

.total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  font-family: var(--font-display);
  font-size: 1.25rem;
}


/* =========================================
   DELIVERY NOTE
   ========================================= */

.delivery-note {
  display: flex;
  align-items: flex-start;

  gap: 10px;

  margin-top: 25px;
  padding-top: 20px;

  border-top: 1px solid var(--color-line);
}

.note-icon {
  flex-shrink: 0;

  width: 18px;
  height: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: var(--color-paper-alt);

  color: var(--color-accent);

  font-size: 0.6rem;
}

.delivery-note strong {
  display: block;

  margin-bottom: 3px;

  font-size: 0.7rem;
  font-weight: 500;
}

.delivery-note p {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.65rem;
}


/* =========================================
   EMPTY
   ========================================= */

.empty {
  max-width: 650px;

  margin: 50px auto 0;

  padding: 60px;

  text-align: center;
}

.empty h2 {
  margin-bottom: 25px;
}


/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 850px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    order: -1;
  }

  .summary-inner {
    position: static;
  }
}

@media (max-width: 600px) {
  .checkout-page {
    padding-top: 35px;
    padding-bottom: 80px;
  }

  .checkout-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 22px;
  }

  .checkout-header h1 {
    font-size: 4rem;
  }

  .checkout-layout {
    padding-top: 25px;
  }

  .summary-inner {
    padding: 22px;
  }

  .field-row {
    grid-template-columns: 1fr;
  }

  .payment-option {
    padding: 15px;
  }

  .payment-mark {
    display: none;
  }

  .empty {
    padding: 40px 25px;
  }
}
</style>