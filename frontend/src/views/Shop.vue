<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";
import ProductCard from "../components/ProductCard.vue";

const route = useRoute();
const router = useRouter();

const products = ref([]);
const loading = ref(true);
const error = ref("");
const search = ref(route.query.search || "");

const categories = [
  { value: "", label: "All pieces" },
  { value: "women-unstitched", label: "Women · Unstitched" },
  { value: "women-stitched", label: "Women · Stitched" },
  { value: "girls", label: "Girls" },
  { value: "boys", label: "Boys" },
];

const currentCategory = () => {
  return categories.find(
    (category) => category.value === (route.query.category || "")
  );
};

const fetchProducts = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await api.get("/products", {
      params: {
        category: route.query.category || undefined,
        search: route.query.search || undefined,
        limit: 24,
      },
    });

    products.value = data.products || [];
  } catch (err) {
    console.error(err);
    error.value = "We couldn't load the collection. Please try again.";
  } finally {
    loading.value = false;
  }
};

const setCategory = (value) => {
  router.push({
    path: "/shop",
    query: {
      ...(value ? { category: value } : {}),
      ...(search.value ? { search: search.value } : {}),
    },
  });
};

const submitSearch = () => {
  router.push({
    path: "/shop",
    query: {
      ...(route.query.category
        ? { category: route.query.category }
        : {}),
      ...(search.value ? { search: search.value } : {}),
    },
  });
};

const clearSearch = () => {
  search.value = "";

  router.push({
    path: "/shop",
    query: route.query.category
      ? { category: route.query.category }
      : {},
  });
};

watch(
  () => route.query,
  () => {
    search.value = route.query.search || "";
    fetchProducts();
  },
  { immediate: true }
);
</script>

<template>
  <main class="shop-page">
    <!-- INTRO -->
    <section class="shop-intro container">
      <div class="intro-content">
        <p class="eyebrow">
          Threads · The collection
        </p>

        <h1>
          {{ currentCategory()?.label || "Everything" }}
        </h1>

        <p class="intro-copy">
          Thoughtfully chosen pieces for women,
          girls and boys.
        </p>
      </div>

      <div class="intro-side">
        <span>01</span>
        <p>Browse the collection</p>
      </div>
    </section>

    <!-- CONTROLS -->
    <section class="controls container">
      <div class="category-scroll">
        <button
          v-for="category in categories"
          :key="category.value"
          type="button"
          class="chip"
          :class="(route.query.category || '') === category.value ? 'active' : ''"

          @click="setCategory(category.value)"
        >
          {{ category.label }}
        </button>
      </div>

      <form
        class="search"
        @submit.prevent="submitSearch"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>

        <input
          v-model="search"
          type="search"
          placeholder="Search products"
          aria-label="Search products"
        />

        <button
          v-if="search"
          type="button"
          class="clear-search"
          aria-label="Clear search"
          @click="clearSearch"
        >
          ×
        </button>
      </form>
    </section>

    <!-- RESULTS -->
    <section class="results-head container">
      <p v-if="!loading">
        {{ products.length }}
        {{ products.length === 1 ? "piece" : "pieces" }}
      </p>

      <p v-else>
        Finding pieces…
      </p>

      <p
        v-if="route.query.search"
        class="search-result"
      >
        Results for
        <strong>“{{ route.query.search }}”</strong>
      </p>
    </section>

    <!-- PRODUCT GRID -->
    <section class="products container">
      <div
        v-if="loading"
        class="loading"
        aria-label="Loading products"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div
        v-else-if="error"
        class="state"
      >
        <h2>Something went wrong</h2>

        <p>{{ error }}</p>

        <button
          type="button"
          class="btn"
          @click="fetchProducts"
        >
          Try again
        </button>
      </div>

      <div
        v-else-if="!products.length"
        class="state"
      >
        <div class="state-number">—</div>

        <h2>
          Nothing here
          <em>yet.</em>
        </h2>

        <p>
          Try another category or search for something else.
        </p>

        <button
          type="button"
          class="btn btn-primary"
          @click="setCategory('')"
        >
          View everything
        </button>
      </div>

      <div
        v-else
        class="grid"
      >
        <ProductCard
          v-for="product in products"
          :key="product._id"
          :product="product"
        />
      </div>
    </section>

    <!-- CLOSING MESSAGE -->
    <section class="shop-footer container">
      <p class="section-kicker">
        Take your time
      </p>

      <h2>
        Good clothes
        <em>don't need rushing.</em>
      </h2>

      <p>
        Browse at your own pace. New pieces are added
        as they arrive in store.
      </p>
    </section>
  </main>
</template>

<style scoped>
.shop-page {
  min-height: 70vh;
}

/* INTRO */

.shop-intro {
  min-height: 330px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 50px;

  padding-top: 55px;
  padding-bottom: 55px;
}

.intro-content {
  max-width: 760px;
}

.eyebrow {
  margin-bottom: 16px;

  color: var(--color-accent);

  font-size: 0.7rem;
  font-weight: 600;

  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.intro-content h1 {
  margin-bottom: 20px;

  font-size: clamp(3.5rem, 7vw, 5.8rem);

  letter-spacing: -0.05em;
  line-height: 0.92;
}

.intro-copy {
  max-width: 450px;

  color: var(--color-ink-soft);

  font-size: 1rem;
}

.intro-side {
  width: 150px;

  padding-left: 24px;

  border-left: 1px solid var(--color-line);

  flex-shrink: 0;
}

.intro-side span {
  display: block;

  margin-bottom: 8px;

  color: var(--color-accent-soft);

  font-family: var(--font-display);

  font-size: 2.5rem;
  line-height: 1;
}

.intro-side p {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.7rem;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* CONTROLS */

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 28px;

  padding-top: 14px;
  padding-bottom: 14px;

  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
}

.category-scroll {
  display: flex;
  align-items: center;

  gap: 6px;

  overflow-x: auto;

  scrollbar-width: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.chip {
  flex-shrink: 0;

  padding: 8px 14px;

  border: 1px solid transparent;

  background: transparent;

  color: var(--color-ink-soft);

  font-family: var(--font-body);

  font-size: 0.68rem;
  font-weight: 500;

  letter-spacing: 0.05em;
  text-transform: uppercase;

  cursor: pointer;

  transition:
    background 180ms ease,
    color 180ms ease,
    border-color 180ms ease;
}

.chip:hover {
  border-color: var(--color-line);
  color: var(--color-ink);
}

.chip.active {
  border-color: var(--color-accent);

  background: var(--color-accent);

  color: var(--color-white);
}

/* SEARCH */

.search {
  width: 230px;

  display: flex;
  align-items: center;

  flex-shrink: 0;

  border-bottom: 1px solid var(--color-ink);
}

.search svg {
  width: 16px;
  height: 16px;

  flex-shrink: 0;

  fill: none;

  stroke: var(--color-ink-soft);

  stroke-width: 1.5;
}

.search input {
  width: 100%;

  padding: 8px;

  border: 0;
  outline: 0;

  background: transparent;

  color: var(--color-ink);

  font-family: var(--font-body);
  font-size: 0.76rem;
}

.search input::placeholder {
  color: var(--color-ink-soft);
}

.clear-search {
  padding: 0;

  border: 0;

  background: transparent;

  color: var(--color-ink-soft);

  font-size: 1.15rem;

  cursor: pointer;
}

/* RESULTS */

.results-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-top: 25px;
  padding-bottom: 20px;
}

.results-head p {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.68rem;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.search-result strong {
  color: var(--color-ink);

  font-weight: 500;
}

/* PRODUCTS */

.products {
  padding-bottom: 110px;
}

.grid {
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 46px 24px;
}

/* LOADING */

.loading {
  min-height: 400px;

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

/* EMPTY / ERROR */

.state {
  min-height: 420px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;
}

.state-number {
  margin-bottom: 12px;

  color: var(--color-accent-soft);

  font-family: var(--font-display);

  font-size: 3.5rem;
}

.state h2 {
  margin-bottom: 12px;

  font-size: clamp(2.3rem, 5vw, 3.5rem);
}

.state h2 em {
  font-weight: 400;
}

.state p {
  margin-bottom: 24px;

  color: var(--color-ink-soft);
}

/* CLOSING MESSAGE */

.shop-footer {
  padding-top: 85px;
  padding-bottom: 105px;

  border-top: 1px solid var(--color-line);

  text-align: center;
}

.section-kicker {
  margin-bottom: 14px;

  color: var(--color-accent);

  font-size: 0.68rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.shop-footer h2 {
  margin-bottom: 20px;

  font-size: clamp(2.8rem, 5.5vw, 4.5rem);

  letter-spacing: -0.04em;
}

.shop-footer h2 em {
  display: block;

  font-weight: 400;
}

.shop-footer > p:last-child {
  max-width: 430px;

  margin: 0 auto;

  color: var(--color-ink-soft);

  font-size: 0.9rem;
}

/* TABLET */

@media (max-width: 1000px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .controls {
    align-items: stretch;

    flex-direction: column;

    gap: 12px;
  }

  .search {
    width: 100%;
  }
}

/* MOBILE */

@media (max-width: 700px) {
  .shop-intro {
    min-height: 260px;

    padding-top: 38px;
    padding-bottom: 42px;
  }

  .intro-content h1 {
    font-size: clamp(3.2rem, 14vw, 4.5rem);
  }

  .intro-copy {
    font-size: 0.9rem;
  }

  .intro-side {
    display: none;
  }

  .controls {
    margin-top: 0;

    padding-top: 12px;
    padding-bottom: 12px;
  }

  .category-scroll {
    margin-right: calc(var(--gutter) * -1);

    padding-right: var(--gutter);
  }

  .chip {
    font-size: 0.64rem;
  }

  .results-head {
    align-items: flex-start;

    flex-direction: column;

    gap: 7px;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);

    gap: 38px 14px;
  }

  .products {
    padding-bottom: 80px;
  }

  .shop-footer {
    padding-top: 70px;
    padding-bottom: 85px;
  }
}
</style>
