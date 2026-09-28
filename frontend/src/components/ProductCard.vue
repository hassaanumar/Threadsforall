<script setup>
import { RouterLink } from "vue-router";

defineProps({
  product: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <RouterLink
    :to="`/product/${product._id}`"
    class="card"
  >
    <div class="thumb">
      <img
        v-if="product.images?.[0]?.url"
        :src="product.images[0].url"
        :alt="product.name"
        loading="lazy"
      />

      <div v-else class="thumb-placeholder">
        <span>Threads</span>
      </div>

      <span
        v-if="product.totalStock === 0"
        class="badge sold-out"
      >
        Sold out
      </span>

      <span
        v-else-if="product.compareAtPrice"
        class="badge sale"
      >
        Sale
      </span>

      <span class="view-product">
        View
        <span>→</span>
      </span>
    </div>

    <div class="product-info">
      <p class="name">{{ product.name }}</p>

      <p class="price">
        <span
          v-if="product.compareAtPrice"
          class="price-strike"
        >
          Rs {{ product.compareAtPrice.toLocaleString() }}
        </span>

        Rs {{ product.price.toLocaleString() }}
      </p>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  display: block;
}

.thumb {
  position: relative;

  aspect-ratio: 3 / 4;

  overflow: hidden;

  background: var(--color-paper-alt);

  margin-bottom: 16px;
}

.thumb img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  transition:
    transform 650ms cubic-bezier(0.2, 0.7, 0.2, 1),
    filter 400ms ease;
}

.card:hover .thumb img {
  transform: scale(1.045);
}

.thumb::after {
  content: "";

  position: absolute;
  inset: 0;

  background: rgba(27, 25, 18, 0);

  transition: background 300ms ease;

  pointer-events: none;
}

.card:hover .thumb::after {
  background: rgba(27, 25, 18, 0.06);
}

.thumb-placeholder {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  background:
    radial-gradient(
      circle at 50% 40%,
      var(--color-accent-soft),
      transparent 55%
    ),
    var(--color-paper-alt);
}

.thumb-placeholder span {
  font-family: var(--font-display);
  font-size: 2rem;
  color: rgba(255, 253, 249, 0.75);
}

.badge {
  position: absolute;
  z-index: 2;

  top: 12px;
  left: 12px;

  padding: 6px 10px;

  border: none;

  background: var(--color-white);

  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sale {
  background: var(--color-accent);
  color: var(--color-white);
}

.view-product {
  position: absolute;
  z-index: 3;

  right: 14px;
  bottom: 14px;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 9px 12px;

  background: var(--color-white);

  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  opacity: 0;
  transform: translateY(6px);

  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.card:hover .view-product {
  opacity: 1;
  transform: translateY(0);
}

.view-product span {
  font-size: 0.9rem;
}

.product-info {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.name {
  margin: 0;

  font-size: 0.82rem;
  line-height: 1.35;
}

.price {
  flex-shrink: 0;

  margin: 0;

  font-family: var(--font-display);
  font-size: 0.95rem;
}

.price-strike {
  display: block;

  margin: 0 0 2px;

  color: var(--color-ink-soft);

  font-family: var(--font-body);
  font-size: 0.7rem;

  text-decoration: line-through;
}

@media (max-width: 640px) {
  .view-product {
    display: none;
  }

  .product-info {
    display: block;
  }

  .price {
    margin-top: 5px;
  }

  .price-strike {
    display: inline;
    margin-right: 5px;
  }
}
</style>
