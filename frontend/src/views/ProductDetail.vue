<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";
import { useCartStore } from "../stores/cart";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();

const product = ref(null);
const loading = ref(true);
const error = ref("");
const activeImage = ref(0);
const selectedSize = ref("");
const selectedColor = ref("");
const quantity = ref(1);
const added = ref(false);

const hasVariants = computed(
  () => product.value?.variants?.length > 0
);

const sizes = computed(() => [
  ...new Set(
    product.value?.variants
      ?.map((variant) => variant.size)
      .filter(Boolean) || []
  ),
]);

const colors = computed(() => [
  ...new Set(
    product.value?.variants
      ?.map((variant) => variant.color)
      .filter(Boolean) || []
  ),
]);

const selectedVariant = computed(() => {
  if (!hasVariants.value) return null;

  return product.value.variants.find(
    (variant) =>
      (variant.size || "") === selectedSize.value &&
      (variant.color || "") === selectedColor.value
  );
});

const availableStock = computed(() => {
  if (hasVariants.value) {
    return selectedVariant.value?.stock ?? 0;
  }

  return product.value?.totalStock ?? 0;
});

const needsSize = computed(
  () => hasVariants.value && sizes.value.length > 0
);

const needsColor = computed(
  () => hasVariants.value && colors.value.length > 0
);

const selectionComplete = computed(() => {
  if (!hasVariants.value) return true;

  if (needsSize.value && !selectedSize.value) {
    return false;
  }

  if (needsColor.value && !selectedColor.value) {
    return false;
  }

  return true;
});

const canAdd = computed(() => {
  if (!product.value) return false;

  if (!selectionComplete.value) return false;

  return availableStock.value > 0;
});

const stockMessage = computed(() => {
  if (!product.value) return "";

  if (hasVariants.value && !selectionComplete.value) {
    return "Select your options to check availability.";
  }

  if (availableStock.value === 0) {
    return "This item is currently sold out.";
  }

  if (availableStock.value < 5) {
    return `Only ${availableStock.value} left.`;
  }

  return "In stock and ready to order.";
});

const categoryLabel = computed(() => {
  if (!product.value?.category) return "Collection";

  return product.value.category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
});

const selectSize = (size) => {
  selectedSize.value = size;
  quantity.value = 1;
};

const selectColor = (color) => {
  selectedColor.value = color;
  quantity.value = 1;
};

const increaseQuantity = () => {
  if (quantity.value < availableStock.value) {
    quantity.value += 1;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
};

const addToCart = () => {
  if (!canAdd.value) return;

  cart.addItem({
    productId: product.value._id,
    name: product.value.name,
    image: product.value.images?.[0]?.url,
    price: product.value.price,
    size: selectedSize.value || undefined,
    color: selectedColor.value || undefined,
    quantity: quantity.value,
    stockAvailable: availableStock.value,
  });

  added.value = true;

  setTimeout(() => {
    added.value = false;
  }, 2500);
};

const goToCart = () => {
  router.push("/cart");
};

onMounted(async () => {
  try {
    const { data } = await api.get(
      `/products/${route.params.id}`
    );

    product.value = data;

    if (sizes.value.length === 1) {
      selectedSize.value = sizes.value[0];
    }

    if (colors.value.length === 1) {
      selectedColor.value = colors.value[0];
    }
  } catch (err) {
    console.error(err);
    error.value = "We couldn't find this product.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="product-page">
    <!-- ERROR -->
    <section
      v-if="!loading && error"
      class="container state"
    >
      <p class="state-number">—</p>

      <h1>Product not found.</h1>

      <p>
        This piece may have been removed or is no longer
        available.
      </p>

      <RouterLink to="/shop" class="btn btn-primary">
        Back to collection
      </RouterLink>
    </section>

    <!-- LOADING -->
    <section
      v-else-if="loading"
      class="container loading"
    >
      <span></span>
      <span></span>
      <span></span>
    </section>

    <!-- PRODUCT -->
    <section
      v-else-if="product"
      class="container detail"
    >
      <!-- GALLERY -->
      <div class="gallery">
        <div class="main-image">
          <img
            v-if="product.images?.length"
            :src="product.images[activeImage]?.url"
            :alt="product.name"
          />

          <div v-else class="placeholder">
            <span>Threads</span>
          </div>

          <span
            v-if="product.totalStock === 0 && !hasVariants"
            class="image-badge"
          >
            Sold out
          </span>
        </div>

        <div
          v-if="product.images?.length > 1"
          class="thumbs"
        >
          <button
            v-for="(image, index) in product.images"
            :key="image.publicId || index"
            type="button"
            class="thumb-btn"
            :class="{
              active: index === activeImage,
            }"
            @click="activeImage = index"
          >
            <img
              :src="image.url"
              :alt="`${product.name} view ${index + 1}`"
            />
          </button>
        </div>
      </div>

      <!-- PRODUCT INFO -->
      <div class="info">
        <p class="eyebrow">
          {{ categoryLabel }}
        </p>

        <h1>{{ product.name }}</h1>

        <div class="price-row">
          <p class="price">
            Rs {{ product.price.toLocaleString() }}
          </p>

          <span
            v-if="product.compareAtPrice"
            class="compare-price"
          >
            Rs
            {{ product.compareAtPrice.toLocaleString() }}
          </span>
        </div>

        <p
          v-if="product.description"
          class="description"
        >
          {{ product.description }}
        </p>

        <div class="divider"></div>

        <!-- SIZE -->
        <div
          v-if="sizes.length"
          class="option-group"
        >
          <div class="option-heading">
            <span>Size</span>

            <span
              v-if="selectedSize"
              class="selected-value"
            >
              {{ selectedSize }}
            </span>
          </div>

          <div class="options">
            <button
              v-for="size in sizes"
              :key="size"
              type="button"
              class="option"
              :class="{
                active: selectedSize === size,
              }"
              @click="selectSize(size)"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- COLOR -->
        <div
          v-if="colors.length"
          class="option-group"
        >
          <div class="option-heading">
            <span>Color</span>

            <span
              v-if="selectedColor"
              class="selected-value"
            >
              {{ selectedColor }}
            </span>
          </div>

          <div class="options">
            <button
              v-for="color in colors"
              :key="color"
              type="button"
              class="option"
              :class="{
                active: selectedColor === color,
              }"
              @click="selectColor(color)"
            >
              {{ color }}
            </button>
          </div>
        </div>

        <!-- STOCK -->
        <p
          class="stock"
          :class="{
            warning:
              availableStock > 0 &&
              availableStock < 5,
            unavailable:
              selectionComplete &&
              availableStock === 0,
          }"
        >
          <span class="stock-dot"></span>
          {{ stockMessage }}
        </p>

        <!-- QUANTITY -->
        <div class="quantity-row">
          <span>Quantity</span>

          <div class="quantity">
            <button
              type="button"
              aria-label="Decrease quantity"
              :disabled="quantity <= 1"
              @click="decreaseQuantity"
            >
              −
            </button>

            <span>{{ quantity }}</span>

            <button
              type="button"
              aria-label="Increase quantity"
              :disabled="
                !availableStock ||
                quantity >= availableStock
              "
              @click="increaseQuantity"
            >
              +
            </button>
          </div>
        </div>

        <!-- ADD TO BAG -->
        <button
          type="button"
          class="add-button"
          :disabled="!canAdd"
          @click="addToCart"
        >
          <span>
            {{
              canAdd
                ? "Add to bag"
                : selectionComplete &&
                    availableStock === 0
                  ? "Sold out"
                  : "Select your options"
            }}
          </span>

          <span v-if="canAdd">
            Rs
            {{
              (product.price * quantity).toLocaleString()
            }}
          </span>
        </button>

        <button
          v-if="added"
          type="button"
          class="bag-button"
          @click="goToCart"
        >
          Added to your bag · View bag →
        </button>

        <!-- DETAILS -->
        <div class="details">
          <div class="detail-row">
            <span>Delivery</span>
            <span>Cash on delivery available</span>
          </div>

          <div class="detail-row">
            <span>Payment</span>
            <span>Cash or card</span>
          </div>

          <div class="detail-row">
            <span>Location</span>
            <span>Bahria Phase 8 · Rawalpindi</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* =========================================
   PAGE
   ========================================= */

.product-page {
  min-height: 70vh;
}

.detail {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(380px, 0.9fr);
  gap: clamp(45px, 7vw, 110px);

  padding-top: 55px;
  padding-bottom: 130px;
}

/* =========================================
   GALLERY
   ========================================= */

.gallery {
  min-width: 0;
}

.main-image {
  position: relative;

  aspect-ratio: 4 / 5;

  overflow: hidden;

  background: var(--color-paper-alt);
}

.main-image img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  transition: transform 500ms ease;
}

.main-image:hover img {
  transform: scale(1.015);
}

.placeholder {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  background:
    radial-gradient(
      circle at 60% 35%,
      var(--color-accent-soft),
      transparent 45%
    ),
    var(--color-paper-alt);
}

.placeholder span {
  color: rgba(255, 253, 249, 0.8);

  font-family: var(--font-display);
  font-size: 5rem;
}

.image-badge {
  position: absolute;
  top: 18px;
  left: 18px;

  padding: 7px 12px;

  background: var(--color-white);

  color: var(--color-ink);

  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.thumbs {
  display: flex;
  gap: 10px;

  margin-top: 14px;

  overflow-x: auto;
}

.thumb-btn {
  flex: 0 0 74px;

  width: 74px;
  height: 92px;

  padding: 0;

  border: 1px solid var(--color-line);
  background: transparent;

  overflow: hidden;

  cursor: pointer;

  opacity: 0.65;

  transition:
    opacity 180ms ease,
    border-color 180ms ease;
}

.thumb-btn:hover,
.thumb-btn.active {
  opacity: 1;
}

.thumb-btn.active {
  border-color: var(--color-accent);
}

.thumb-btn img {
  width: 100%;
  height: 100%;

  object-fit: cover;
}

/* =========================================
   INFO
   ========================================= */

.info {
  padding-top: 10px;
}

.eyebrow {
  margin-bottom: 18px;

  color: var(--color-accent);

  font-size: 0.68rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.info h1 {
  max-width: 650px;

  margin-bottom: 20px;

  font-size: clamp(2.7rem, 5vw, 5rem);
  letter-spacing: -0.045em;
  line-height: 0.94;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 13px;

  margin-bottom: 28px;
}

.price {
  margin: 0;

  font-family: var(--font-display);
  font-size: 1.5rem;
}

.compare-price {
  color: var(--color-ink-soft);

  font-family: var(--font-display);
  font-size: 1rem;

  text-decoration: line-through;
}

.description {
  max-width: 560px;

  margin-bottom: 30px;

  color: var(--color-ink-soft);
  font-size: 0.95rem;
}

.divider {
  height: 1px;

  margin: 30px 0;

  background: var(--color-line);
}

/* =========================================
   OPTIONS
   ========================================= */

.option-group {
  margin-bottom: 27px;
}

.option-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 11px;

  font-size: 0.72rem;
  font-weight: 600;

  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.selected-value {
  color: var(--color-ink-soft);

  font-weight: 400;

  text-transform: none;
  letter-spacing: 0;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option {
  min-width: 58px;

  padding: 11px 16px;

  border: 1px solid var(--color-line);

  background: transparent;

  color: var(--color-ink);

  font-family: var(--font-body);
  font-size: 0.8rem;

  cursor: pointer;

  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease;
}

.option:hover {
  border-color: var(--color-ink);
}

.option.active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-white);
}

/* =========================================
   STOCK
   ========================================= */

.stock {
  display: flex;
  align-items: center;
  gap: 8px;

  margin: 8px 0 22px;

  color: #4c704f;

  font-size: 0.75rem;
}

.stock-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: currentColor;
}

.stock.warning {
  color: var(--color-rose);
}

.stock.unavailable {
  color: var(--color-error);
}

/* =========================================
   QUANTITY
   ========================================= */

.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 14px;

  font-size: 0.72rem;
  font-weight: 600;

  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.quantity {
  display: flex;
  align-items: center;

  border: 1px solid var(--color-line);
}

.quantity button {
  width: 38px;
  height: 38px;

  border: 0;
  background: transparent;

  color: var(--color-ink);

  font-size: 1.1rem;

  cursor: pointer;
}

.quantity button:hover:not(:disabled) {
  background: var(--color-paper-alt);
}

.quantity button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quantity span {
  width: 34px;

  text-align: center;

  font-size: 0.8rem;
}

/* =========================================
   CART ACTIONS
   ========================================= */

.add-button {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 18px 20px;

  border: 1px solid var(--color-accent);

  background: var(--color-accent);
  color: var(--color-white);

  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;

  letter-spacing: 0.07em;
  text-transform: uppercase;

  cursor: pointer;

  transition:
    background 180ms ease,
    border-color 180ms ease;
}

.add-button:hover:not(:disabled) {
  background: #24305e;
  border-color: #24305e;
}

.add-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bag-button {
  width: 100%;

  margin-top: 9px;
  padding: 14px;

  border: 1px solid var(--color-line);
  background: var(--color-white);

  color: var(--color-ink);

  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  cursor: pointer;

  transition:
    border-color 180ms ease,
    color 180ms ease;
}

.bag-button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* =========================================
   DETAILS
   ========================================= */

.details {
  margin-top: 35px;

  border-top: 1px solid var(--color-line);
}

.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 30px;

  padding: 15px 0;

  border-bottom: 1px solid var(--color-line);

  font-size: 0.72rem;
}

.detail-row span:first-child {
  color: var(--color-ink-soft);

  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.detail-row span:last-child {
  text-align: right;
}

/* =========================================
   STATES
   ========================================= */

.loading {
  min-height: 600px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 7px;
}

.loading span {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--color-accent);

  animation: pulse 1s infinite alternate;
}

.loading span:nth-child(2) {
  animation-delay: 150ms;
}

.loading span:nth-child(3) {
  animation-delay: 300ms;
}

@keyframes pulse {
  from {
    opacity: 0.2;
    transform: translateY(2px);
  }

  to {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.state {
  min-height: 650px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
}

.state-number {
  color: var(--color-accent-soft);

  font-family: var(--font-display);
  font-size: 4rem;
}

.state h1 {
  margin-bottom: 14px;

  font-size: clamp(2.5rem, 5vw, 4rem);
}

.state p:not(.state-number) {
  margin-bottom: 28px;

  color: var(--color-ink-soft);
}

/* =========================================
   RESPONSIVE
   ========================================= */

@media (max-width: 900px) {
  .detail {
    grid-template-columns: 1fr;

    gap: 45px;

    padding-top: 35px;
  }

  .info {
    padding-top: 0;
  }

  .info h1 {
    font-size: clamp(3rem, 9vw, 5rem);
  }
}

@media (max-width: 600px) {
  .detail {
    padding-bottom: 90px;
  }

  .main-image {
    aspect-ratio: 4 / 5;
  }

  .info h1 {
    font-size: clamp(2.8rem, 13vw, 4.2rem);
  }

  .description {
    font-size: 0.9rem;
  }

  .thumb-btn {
    flex-basis: 62px;
    width: 62px;
    height: 78px;
  }

  .detail-row {
    gap: 15px;
  }
}
</style>
