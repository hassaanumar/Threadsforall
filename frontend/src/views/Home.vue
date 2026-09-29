<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import api from "../api/axios";
import ProductCard from "../components/ProductCard.vue";
import Reviews from "../components/Reviews.vue";

const featured = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get("/products", {
      params: {
        featured: true,
        limit: 8,
      },
    });

    featured.value = data.products || [];
  } catch (error) {
    console.error("Failed to load featured products:", error);
  } finally {
    loading.value = false;
  }
});

const heroImage = () => {
  return featured.value[0]?.images?.[0]?.url || "";
};
</script>

<template>
  <main>
    <!-- HERO -->
    <section class="hero">
      <div class="hero-image">
        <img
          v-if="heroImage()"
          :src="heroImage()"
          alt="Threads clothing collection"
        />

        <div v-else class="hero-placeholder">
          <span>Threads</span>
        </div>

        <div class="hero-image-label">
          <span>01</span>
          <span>Threads Collection</span>
        </div>
      </div>

      <div class="hero-content container">
        <p class="eyebrow">Threads · Rawalpindi</p>

        <h1>
          Made for
          <em>everyday</em>
          moments.
        </h1>

        <p class="hero-copy">
          Women's unstitched clothing and girls' wear,
          thoughtfully chosen for the people you love.
        </p>

        <div class="hero-actions">
          <RouterLink to="/shop" class="btn btn-primary">
            Shop the collection
          </RouterLink>

          <RouterLink
            to="/shop?category=women-unstitched"
            class="text-link"
          >
            Explore women
            <span>→</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- INTRO -->
    <section class="intro container">
      <p class="intro-kicker">The Threads edit</p>

      <h2>
        Pieces you'll reach for
        <span>again and again.</span>
      </h2>

      <p class="intro-copy">
        From everyday fabrics to something a little more special,
        Threads brings together clothing that feels beautiful,
        comfortable and easy to make your own.
      </p>
    </section>

    <!-- CATEGORIES -->
    <section class="categories container">
      <RouterLink
        to="/shop?category=women-unstitched"
        class="category-card category-women"
      >
        <div class="category-overlay"></div>

        <div class="category-content">
          <h3>
            Women's<br />
            Collection
          </h3>
          <span>Shop now →</span>
        </div>
      </RouterLink>

      <RouterLink
        to="/shop?category=girls"
        class="category-card category-girls"
      >
        <div class="category-overlay"></div>

        <div class="category-content">
          <h3>
            Little<br />
            Threads
          </h3>
          <span>Shop now →</span>
        </div>
      </RouterLink>
    </section>

    <!-- NEW ARRIVALS -->
    <section class="featured container">
      <div class="section-head">
        <div>
          <p class="section-kicker">Just arrived</p>
          <h2>New in</h2>
        </div>

        <RouterLink to="/shop" class="view-all">
          View all
          <span>→</span>
        </RouterLink>
      </div>

      <div v-if="loading" class="loading">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div v-else-if="!featured.length" class="empty">
        <p>No products yet.</p>

        <RouterLink to="/admin/products" class="btn">
          Add products
        </RouterLink>
      </div>

      <div v-else class="product-grid">
        <ProductCard
          v-for="product in featured"
          :key="product._id"
          :product="product"
        />
      </div>
    </section>

    <!-- BRAND STORY -->
    <section class="story">
      <div class="story-inner container">
        <div class="story-number">03</div>

        <div class="story-content">
          <p class="section-kicker">
            Our little corner of Threads
          </p>

          <h2>
            From Bahria Phase 8,
            <em>with care.</em>
          </h2>

          <p>
            Threads started with something simple:
            finding beautiful clothes for women and children
            without making shopping feel complicated.
          </p>

          <p>
            We're a local clothing shop, building an online
            collection with the same personal care we'd give
            you in-store.
          </p>

          <RouterLink to="/shop" class="text-link">
            Discover Threads
            <span>→</span>
          </RouterLink>
        </div>
      </div>
    </section>
   
<!-- CUSTOMER REVIEWS -->
    <Reviews />
    <!-- FINAL CTA -->
    <section class="final-cta container">
      <p class="section-kicker">
        Find your next favourite
      </p>

      <h2>
        There's always
        <em>something new.</em>
      </h2>

      <RouterLink to="/shop" class="btn btn-primary">
        Shop everything
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
/* =========================================
   HERO
   ========================================= */

.hero {
  position: relative;
  min-height: min(760px, 82vh);
  overflow: hidden;
  background: var(--color-paper-alt);
}

.hero-image {
  position: absolute;
  inset: 0;
  background: var(--color-paper-alt);
}

.hero-image::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(27, 25, 18, 0.72) 0%,
    rgba(27, 25, 18, 0.28) 48%,
    rgba(27, 25, 18, 0.05) 100%
  );
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  background:
    radial-gradient(
      circle at 70% 30%,
      var(--color-accent-soft),
      transparent 40%
    ),
    var(--color-paper-alt);
}

.hero-placeholder span {
  font-family: var(--font-display);
  font-size: clamp(5rem, 12vw, 11rem);
  color: rgba(255, 253, 249, 0.7);
}

.hero-content {
  position: relative;
  z-index: 2;

  min-height: min(760px, 82vh);

  display: flex;
  flex-direction: column;
  justify-content: center;

  color: var(--color-white);
}

.hero-content .eyebrow {
  color: rgba(255, 253, 249, 0.78);
  margin-bottom: 20px;
}

.hero-content h1 {
  max-width: 700px;

  color: var(--color-white);

  font-size: clamp(3.5rem, 8vw, 7.5rem);
  letter-spacing: -0.045em;
  line-height: 0.9;
}

.hero-content h1 em {
  font-style: italic;
  font-weight: 400;
}

.hero-copy {
  max-width: 480px;
  margin: 30px 0;

  color: rgba(255, 253, 249, 0.86);
  font-size: 1.05rem;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 28px;
}

.hero-actions .btn-primary {
  background: var(--color-white);
  border-color: var(--color-white);
  color: var(--color-ink);
}

.hero-actions .btn-primary:hover {
  background: var(--color-paper);
}

.hero-image-label {
  position: absolute;
  z-index: 3;

  right: 28px;
  bottom: 28px;

  display: flex;
  gap: 12px;

  color: rgba(255, 253, 249, 0.75);

  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* =========================================
   INTRO
   ========================================= */

.intro {
  padding-top: 140px;
  padding-bottom: 120px;
  text-align: center;
}

.intro-kicker,
.section-kicker {
  margin-bottom: 16px;

  color: var(--color-accent);

  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.intro h2 {
  max-width: 760px;
  margin: 0 auto 26px;

  font-size: clamp(2.8rem, 6vw, 5.5rem);
  letter-spacing: -0.04em;
}

.intro h2 span {
  display: block;
  font-style: italic;
  font-weight: 400;
}

.intro-copy {
  max-width: 560px;
  margin: 0 auto;
  color: var(--color-ink-soft);
}

/* =========================================
   CATEGORIES
   ========================================= */

.categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  padding-bottom: 140px;
}

.category-card {
  position: relative;

  min-height: 560px;

  overflow: hidden;

  display: flex;
  align-items: flex-end;

  background: var(--color-paper-alt);
}

.category-card::before {
  content: "";

  position: absolute;
  inset: 0;

  background: linear-gradient(
    to top,
    rgba(27, 25, 18, 0.65),
    transparent 60%
  );

  z-index: 1;
}

.category-card::after {
  content: "";

  position: absolute;
  inset: 0;

  background: var(--color-accent);

  opacity: 0;

  transition: opacity 350ms ease;
}

.category-card:hover::after {
  opacity: 0.08;
}

.category-women {
  background: linear-gradient(
    145deg,
    #a89987,
    #756b61
  );
}

.category-girls {
  background: linear-gradient(
    145deg,
    #c9a7a5,
    #94777b
  );
}

.category-content {
  position: relative;
  z-index: 2;

  padding: 38px;

  color: var(--color-white);
}

.category-content p {
  margin-bottom: 14px;

  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.category-content h3 {
  margin-bottom: 28px;

  color: var(--color-white);

  font-size: clamp(2.5rem, 5vw, 4.5rem);
  letter-spacing: -0.04em;
  line-height: 0.9;
}

.category-content span {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* =========================================
   FEATURED
   ========================================= */

.featured {
  padding-bottom: 150px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  margin-bottom: 42px;
}

.section-head h2 {
  margin: 0;

  font-size: clamp(2.5rem, 5vw, 4.5rem);
  letter-spacing: -0.04em;
}

.section-kicker {
  margin-bottom: 10px;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 12px;

  padding-bottom: 7px;

  border-bottom: 1px solid var(--color-ink);

  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  transition:
    color 180ms ease,
    border-color 180ms ease;
}

.view-all:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.view-all span {
  font-size: 1rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 46px 24px;
}

/* Loading */

.loading {
  min-height: 300px;

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
    opacity: 0.25;
    transform: translateY(2px);
  }

  to {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.empty {
  padding: 80px 20px;
  text-align: center;
}

/* =========================================
   STORY
   ========================================= */

.story {
  background: var(--color-accent);
  color: var(--color-white);
}

.story-inner {
  min-height: 620px;

  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 80px;
  align-items: center;
}

.story-number {
  align-self: start;
  padding-top: 90px;

  color: rgba(255, 255, 255, 0.35);

  font-family: var(--font-display);
  font-size: 8rem;
  line-height: 1;
}

.story-content {
  max-width: 620px;
}

.story-content .section-kicker {
  color: rgba(255, 255, 255, 0.65);
}

.story-content h2 {
  margin-bottom: 32px;

  color: var(--color-white);

  font-size: clamp(3rem, 6vw, 5.5rem);
  letter-spacing: -0.04em;
}

.story-content h2 em {
  font-weight: 400;
}

.story-content p {
  color: rgba(255, 255, 255, 0.78);
}

.story-content .text-link {
  display: inline-flex;
  gap: 12px;

  margin-top: 18px;
  padding-bottom: 6px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.6);

  color: var(--color-white);

  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}


/* =========================================
   FINAL CTA
   ========================================= */

.final-cta {
  padding-top: 150px;
  padding-bottom: 160px;

  text-align: center;
}

.final-cta h2 {
  max-width: 800px;
  margin: 0 auto 40px;

  font-size: clamp(3rem, 7vw, 6rem);
  letter-spacing: -0.045em;
}

.final-cta h2 em {
  display: block;
  font-weight: 400;
}
/* =========================================
   REVIEWS
   ========================================= */

.reviews {
  padding-top: 120px;
  padding-bottom: 140px;

  border-top: 1px solid var(--color-line);
}

.reviews-head {
  max-width: 620px;
  margin-bottom: 55px;
}

.reviews-head h2 {
  margin-bottom: 22px;

  font-size: clamp(3rem, 6vw, 5rem);
  letter-spacing: -0.045em;
  line-height: 0.95;
}

.reviews-head h2 em {
  font-weight: 400;
}

.reviews-intro {
  max-width: 480px;

  color: var(--color-ink-soft);
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);
}

.review {
  padding: 32px 30px 34px;
}

.review + .review {
  border-left: 1px solid var(--color-line);
}

.stars {
  margin-bottom: 22px;

  color: var(--color-accent);

  font-size: 0.72rem;
  letter-spacing: 0.18em;
}

.review-text {
  min-height: 105px;

  margin-bottom: 25px;

  font-family: var(--font-display);
  font-size: 1.15rem;
  line-height: 1.45;
}

.review-name {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
/* =========================================
   REVIEWS RESPONSIVE
   ========================================= */

@media (max-width: 700px) {
  .reviews {
    padding-top: 80px;
    padding-bottom: 90px;
  }

  .reviews-head {
    margin-bottom: 38px;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
  }

  .review {
    padding: 28px 0;
  }

  .review + .review {
    border-left: 0;
    border-top: 1px solid var(--color-line);
  }

  .review-text {
    min-height: auto;
    margin-bottom: 20px;
  }
}

/* =========================================
   RESPONSIVE
   ========================================= */

@media (max-width: 900px) {
  .hero,
  .hero-content {
    min-height: 680px;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .categories {
    padding-bottom: 100px;
  }

  .category-card {
    min-height: 480px;
  }

  .story-inner {
    min-height: 520px;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .story-number {
    display: none;
  }
}

@media (max-width: 640px) {
  .hero,
  .hero-content {
    min-height: 650px;
  }

  .hero-content h1 {
    font-size: clamp(3.3rem, 15vw, 5rem);
  }

  .hero-copy {
    font-size: 0.95rem;
  }

  .hero-actions {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .intro {
    padding-top: 90px;
    padding-bottom: 80px;
  }

  .categories {
    grid-template-columns: 1fr;
    padding-bottom: 90px;
  }

  .category-card {
    min-height: 460px;
  }

  .category-content {
    padding: 28px;
  }

  .featured {
    padding-bottom: 100px;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .product-grid {
    gap: 36px 14px;
  }

  .story-inner {
    min-height: 560px;
  }
  .final-cta {
    padding-top: 100px;
    padding-bottom: 110px;
  }
}
</style>
