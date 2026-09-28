<script setup>
import { ref, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import api from "../api/axios";

const route = useRoute();

const order = ref(null);
const loading = ref(true);

onMounted(async () => {
  const orderNumber = route.query.order;

  if (orderNumber) {
    try {
      const { data } = await api.get(
        `/orders/track/${orderNumber}`
      );

      order.value = data;
    } catch {
      order.value = null;
    }
  }

  loading.value = false;
});

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString();
};
</script>

<template>
  <main class="success-page">
    <section class="container">
      <!-- LOADING -->
      <div
        v-if="loading"
        class="loading"
      >
        <span class="loading-mark">T</span>
        <p>Loading your order...</p>
      </div>

      <!-- SUCCESS -->
      <div
        v-else-if="order"
        class="success"
      >
        <div class="success-intro">
          <div class="checkmark">
            <span>✓</span>
          </div>

          <p class="eyebrow">
            Order confirmed
          </p>

          <h1>
            Thank you,
            <em>{{ order.customer.name }}</em>.
          </h1>

          <p class="intro-copy">
            We've received your order and will
            take care of it from here.
          </p>
        </div>

        <div class="order-card">
          <!-- ORDER HEADER -->
          <div class="order-card-header">
            <div>
              <p class="card-label">
                Order reference
              </p>

              <p class="order-number">
                {{ order.orderNumber }}
              </p>
            </div>

            <div
              class="status"
              :class="{
                paid:
                  order.paymentStatus === 'paid',
              }"
            >
              <span class="status-dot"></span>

              {{
                order.paymentStatus === "paid"
                  ? "Paid"
                  : "Payment pending"
              }}
            </div>
          </div>

          <div class="divider"></div>

          <!-- ITEMS -->
          <div class="items">
            <div
              v-for="item in order.items"
              :key="`${item.product}-${item.size}-${item.color}`"
              class="item"
            >
              <div class="item-image">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                />

                <span v-else>Threads</span>

                <small>
                  {{ item.quantity }}
                </small>
              </div>

              <div class="item-info">
                <p class="item-name">
                  {{ item.name }}
                </p>

                <p
                  v-if="item.size || item.color"
                  class="item-meta"
                >
                  <span v-if="item.size">
                    Size {{ item.size }}
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

              <p class="item-price">
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

          <div class="divider"></div>

          <!-- TOTALS -->
          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>

              <span>
                Rs
                {{ formatPrice(order.subtotal) }}
              </span>
            </div>

            <div class="total-row muted">
              <span>Shipping</span>

              <span>
                Rs
                {{
                  formatPrice(order.shippingFee)
                }}
              </span>
            </div>

            <div class="total-row grand-total">
              <span>Total</span>

              <span>
                Rs
                {{ formatPrice(order.total) }}
              </span>
            </div>
          </div>
        </div>

        <!-- DELIVERY MESSAGE -->
        <div class="next-step">
          <div class="next-icon">
            →
          </div>

          <div>
            <p class="next-title">
              {{
                order.paymentMethod === "cod"
                  ? "What's next?"
                  : "Payment received"
              }}
            </p>

            <p class="next-copy">
              <template
                v-if="
                  order.paymentMethod === 'cod'
                "
              >
                Your order will be delivered to
                <strong>
                  {{ order.customer.address }}
                </strong>
                <span v-if="order.customer.city">
                  , {{ order.customer.city }}
                </span>.
                Please keep
                <strong>
                  Rs {{ formatPrice(order.total) }}
                </strong>
                ready for cash on delivery.
              </template>

              <template v-else>
                Your payment has been received.
                We'll prepare your order for
                delivery to
                <strong>
                  {{ order.customer.address }}
                </strong>
                <span v-if="order.customer.city">
                  , {{ order.customer.city }}
                </span>.
              </template>
            </p>
          </div>
        </div>

        <div class="actions">
          <RouterLink
            to="/shop"
            class="btn btn-primary"
          >
            Continue shopping
          </RouterLink>

          <RouterLink
            to="/"
            class="home-link"
          >
            Back to Threads
          </RouterLink>
        </div>

        <p class="footer-note">
          Thank you for shopping with Threads.
        </p>
      </div>

      <!-- NOT FOUND -->
      <div
        v-else
        class="not-found"
      >
        <p class="eyebrow">
          Order not found
        </p>

        <h1>
          We couldn't find that order.
        </h1>

        <p>
          The order reference may be missing or
          the order may still be processing.
        </p>

        <RouterLink
          to="/shop"
          class="btn btn-primary"
        >
          Back to shop
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* =========================================
   PAGE
   ========================================= */

.success-page {
  min-height: 80vh;
  padding: 70px 0 110px;
}

/* =========================================
   LOADING
   ========================================= */

.loading {
  min-height: 50vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  color: var(--color-ink-soft);

  text-align: center;
}

.loading-mark {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 15px;

  border: 1px solid var(--color-line);

  font-family: var(--font-display);
  font-size: 1.2rem;
}

/* =========================================
   SUCCESS INTRO
   ========================================= */

.success {
  max-width: 760px;

  margin: 0 auto;
}

.success-intro {
  text-align: center;
}

.checkmark {
  width: 58px;
  height: 58px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 25px;

  border-radius: 50%;

  background: var(--color-accent);

  color: var(--color-white);
}

.checkmark span {
  font-size: 1.35rem;
}

.eyebrow {
  margin: 0 0 15px;

  color: var(--color-accent);

  font-size: 0.67rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.success-intro h1 {
  margin: 0;

  font-size: clamp(3rem, 7vw, 5.2rem);

  letter-spacing: -0.05em;
  line-height: 0.95;
}

.success-intro h1 em {
  font-style: italic;
  font-weight: 400;
}

.intro-copy {
  max-width: 430px;

  margin: 20px auto 45px;

  color: var(--color-ink-soft);

  font-size: 0.9rem;
}

/* =========================================
   ORDER CARD
   ========================================= */

.order-card {
  border: 1px solid var(--color-line);

  background: var(--color-white);
}

.order-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 25px 28px;
}

.card-label {
  margin: 0 0 5px;

  color: var(--color-ink-soft);

  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.order-number {
  margin: 0;

  font-family: var(--font-display);
  font-size: 1.05rem;
  letter-spacing: 0.04em;
}

.status {
  display: flex;
  align-items: center;

  gap: 7px;

  color: var(--color-ink-soft);

  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.status-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: var(--color-rose);
}

.status.paid .status-dot {
  background: #5d9167;
}

/* =========================================
   DIVIDER
   ========================================= */

.divider {
  height: 1px;

  margin: 0 28px;

  background: var(--color-line);
}

/* =========================================
   ITEMS
   ========================================= */

.items {
  padding: 20px 28px;
}

.item {
  display: grid;

  grid-template-columns: 55px 1fr auto;

  align-items: center;

  gap: 14px;

  padding: 9px 0;
}

.item-image {
  position: relative;

  width: 55px;
  height: 68px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: visible;

  background: var(--color-paper-alt);
}

.item-image img {
  width: 100%;
  height: 100%;

  object-fit: cover;
}

.item-image > span {
  color: var(--color-ink-soft);

  font-family: var(--font-display);
  font-size: 0.75rem;
}

.item-image small {
  position: absolute;

  top: -6px;
  right: -6px;

  min-width: 18px;
  height: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 4px;

  border-radius: 50%;

  background: var(--color-accent);
  color: var(--color-white);

  font-size: 0.55rem;
}

.item-info {
  min-width: 0;
}

.item-name {
  margin: 0 0 4px;

  font-family: var(--font-display);
  font-size: 0.9rem;
}

.item-meta {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.65rem;
}

.item-price {
  margin: 0;

  font-family: var(--font-display);
  font-size: 0.82rem;

  white-space: nowrap;
}

/* =========================================
   TOTALS
   ========================================= */

.totals {
  padding: 20px 28px 25px;
}

.total-row {
  display: flex;
  justify-content: space-between;

  margin-bottom: 10px;

  font-size: 0.76rem;
}

.total-row.muted {
  color: var(--color-ink-soft);
}

.total-row.grand-total {
  align-items: baseline;

  margin-top: 17px;
  margin-bottom: 0;

  padding-top: 17px;

  border-top: 1px solid var(--color-line);

  font-family: var(--font-display);
  font-size: 1.25rem;
}

/* =========================================
   NEXT STEP
   ========================================= */

.next-step {
  display: flex;

  gap: 15px;

  margin-top: 20px;
  padding: 20px;

  border: 1px solid var(--color-line);

  background: transparent;
}

.next-icon {
  flex-shrink: 0;

  width: 28px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--color-paper-alt);

  color: var(--color-accent);

  font-size: 0.8rem;
}

.next-title {
  margin: 0 0 5px;

  font-size: 0.73rem;
  font-weight: 600;
}

.next-copy {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.7rem;
  line-height: 1.6;
}

.next-copy strong {
  color: var(--color-ink);
  font-weight: 500;
}

/* =========================================
   ACTIONS
   ========================================= */

.actions {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 25px;

  margin-top: 30px;
}

.home-link {
  color: var(--color-ink-soft);

  font-size: 0.7rem;

  text-decoration: underline;
  text-underline-offset: 4px;
}

.home-link:hover {
  color: var(--color-accent);
}

.footer-note {
  margin: 45px auto 0;

  color: var(--color-ink-soft);

  font-family: var(--font-display);
  font-size: 0.9rem;

  text-align: center;
}

/* =========================================
   NOT FOUND
   ========================================= */

.not-found {
  max-width: 560px;

  margin: 80px auto;

  text-align: center;
}

.not-found h1 {
  font-size: clamp(2.5rem, 6vw, 4rem);
}

.not-found > p:not(.eyebrow) {
  margin: 15px auto 28px;

  color: var(--color-ink-soft);
}

/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 600px) {
  .success-page {
    padding-top: 45px;
    padding-bottom: 80px;
  }

  .success-intro h1 {
    font-size: 3.2rem;
  }

  .intro-copy {
    margin-bottom: 30px;
  }

  .order-card-header {
    padding: 20px;
  }

  .divider {
    margin: 0 20px;
  }

  .items {
    padding: 17px 20px;
  }

  .totals {
    padding: 17px 20px 22px;
  }

  .status {
    font-size: 0;
  }

  .status-dot {
    width: 9px;
    height: 9px;
  }

  .next-step {
    padding: 17px;
  }

  .actions {
    flex-direction: column;

    gap: 18px;
  }

  .actions .btn {
    width: 100%;
  }
}
</style>
