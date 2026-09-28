<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import api from "../api/axios";

const reviews = ref([]);
const loading = ref(true);
const currentIndex = ref(0);

let autoplayTimer = null;

const fetchReviews = async () => {
  try {
    const { data } = await api.get("/reviews");

    reviews.value = data.reviews || data || [];
  } catch (error) {
    console.error("Failed to load reviews:", error);
  } finally {
    loading.value = false;
  }
};

const nextReview = () => {
  if (reviews.value.length <= 1) {
    return;
  }

  currentIndex.value =
    (currentIndex.value + 1) % reviews.value.length;
};

const previousReview = () => {
  if (reviews.value.length <= 1) {
    return;
  }

  currentIndex.value =
    (currentIndex.value - 1 + reviews.value.length) %
    reviews.value.length;
};

const startAutoplay = () => {
  stopAutoplay();

  if (reviews.value.length <= 1) {
    return;
  }

  autoplayTimer = setInterval(() => {
    nextReview();
  }, 4500);
};

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
};

const selectReview = (index) => {
  currentIndex.value = index;

  startAutoplay();
};

onMounted(async () => {
  await fetchReviews();

  startAutoplay();
});

onUnmounted(() => {
  stopAutoplay();
});
</script>

<template>
  <section
    v-if="reviews.length"
    class="reviews-section"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div class="reviews-container container">

      <!-- HEADING -->

      <div class="reviews-heading">

        <p class="section-kicker">
          From our customers
        </p>

        <h2>
          A few words
          <em>from you.</em>
        </h2>

      </div>


      <!-- REVIEW SLIDER -->

      <div class="review-slider">

        <!-- PREVIOUS -->

        <button
          v-if="reviews.length > 1"
          type="button"
          class="review-arrow review-arrow-left"
          aria-label="Previous review"
          @click="previousReview"
        >
          ←
        </button>


        <!-- REVIEW -->

        <div class="review-window">

          <Transition
            name="review"
            mode="out-in"
          >

            <div
              :key="reviews[currentIndex]?._id || currentIndex"
              class="review-card"
            >

              <!-- STARS -->

              <div
                class="stars"
                aria-label="Customer rating"
              >

                <span
                  v-for="star in 5"
                  :key="star"
                  :class="{
                    active:
                      star <=
                      Number(
                        reviews[currentIndex]?.rating || 5
                      )
                  }"
                >
                  ★
                </span>

              </div>


              <!-- COMMENT -->

              <blockquote>
                “{{ reviews[currentIndex]?.comment }}”
              </blockquote>


              <!-- CUSTOMER -->

              <div class="review-author">

                <span class="author-line"></span>

                <span>
                  {{ reviews[currentIndex]?.name }}
                </span>

                <span
                  v-if="reviews[currentIndex]?.city"
                >
                  · {{ reviews[currentIndex]?.city }}
                </span>

              </div>

            </div>

          </Transition>

        </div>


        <!-- NEXT -->

        <button
          v-if="reviews.length > 1"
          type="button"
          class="review-arrow review-arrow-right"
          aria-label="Next review"
          @click="nextReview"
        >
          →
        </button>

      </div>


      <!-- DOTS -->

      <div
        v-if="reviews.length > 1"
        class="review-dots"
      >

        <button
          v-for="(review, index) in reviews"
          :key="review._id || index"
          type="button"
          class="review-dot"
          :class="{
            active: index === currentIndex
          }"
          :aria-label="`Show review ${index + 1}`"
          @click="selectReview(index)"
        ></button>

      </div>


      <!-- SMALL MESSAGE -->

      <p class="reviews-note">
        Your experience matters to us.
      </p>

    </div>
  </section>
</template>


<style scoped>
.reviews-section {
  width: 100%;

  background: var(--color-paper-alt);

  border-top: 1px solid var(--color-line);
  border-bottom: 1px solid var(--color-line);

  overflow: hidden;
}


.reviews-container {
  padding-top: 110px;
  padding-bottom: 110px;
}


/* =========================================
   HEADING
   ========================================= */

.reviews-heading {
  margin-bottom: 60px;

  text-align: center;
}


.section-kicker {
  margin: 0 0 12px;

  color: var(--color-accent);

  font-size: 0.7rem;
  font-weight: 600;

  letter-spacing: 0.14em;

  text-transform: uppercase;
}


.reviews-heading h2 {
  margin: 0;

  font-size: clamp(3rem, 6vw, 5.5rem);

  line-height: 0.95;

  letter-spacing: -0.045em;
}


.reviews-heading h2 em {
  display: block;

  font-weight: 400;
}


/* =========================================
   REVIEW SLIDER
   ========================================= */

.review-slider {
  position: relative;

  max-width: 900px;

  min-height: 300px;

  margin: 0 auto;

  display: flex;

  align-items: center;

  justify-content: center;
}


.review-window {
  width: 100%;

  overflow: hidden;
}


.review-card {
  width: 100%;

  padding: 0 75px;

  text-align: center;
}


/* =========================================
   STARS
   ========================================= */

.stars {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 5px;

  margin-bottom: 25px;

  color: var(--color-line);

  font-size: 0.75rem;
}


.stars span.active {
  color: var(--color-accent);
}


/* =========================================
   COMMENT
   ========================================= */

.review-card blockquote {
  max-width: 720px;

  margin: 0 auto 32px;

  font-family: var(--font-display);

  font-size: clamp(
    1.8rem,
    4vw,
    3.1rem
  );

  line-height: 1.12;

  letter-spacing: -0.025em;
}


/* =========================================
   CUSTOMER NAME
   ========================================= */

.review-author {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  color: var(--color-ink-soft);

  font-size: 0.68rem;

  text-transform: uppercase;

  letter-spacing: 0.1em;
}


.author-line {
  width: 24px;

  height: 1px;

  background: var(--color-accent);
}


/* =========================================
   ARROWS
   ========================================= */

.review-arrow {
  position: absolute;

  top: 50%;

  transform: translateY(-50%);

  width: 44px;

  height: 44px;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 0;

  border: 1px solid var(--color-line);

  border-radius: 50%;

  background: transparent;

  color: var(--color-ink);

  font-size: 1rem;

  cursor: pointer;

  transition:
    background 180ms ease,
    color 180ms ease,
    border-color 180ms ease;
}


.review-arrow:hover {
  background: var(--color-accent);

  border-color: var(--color-accent);

  color: var(--color-white);
}


.review-arrow-left {
  left: 0;
}


.review-arrow-right {
  right: 0;
}


/* =========================================
   DOTS
   ========================================= */

.review-dots {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  margin-top: 28px;
}


.review-dot {
  width: 5px;

  height: 5px;

  padding: 0;

  border: 0;

  border-radius: 50%;

  background: var(--color-line);

  cursor: pointer;

  transition:
    width 200ms ease,
    background 200ms ease;
}


.review-dot.active {
  width: 22px;

  border-radius: 10px;

  background: var(--color-accent);
}


/* =========================================
   BOTTOM MESSAGE
   ========================================= */

.reviews-note {
  margin: 40px 0 0;

  text-align: center;

  color: var(--color-ink-soft);

  font-size: 0.68rem;

  text-transform: uppercase;

  letter-spacing: 0.1em;
}


/* =========================================
   REVIEW ANIMATION
   ========================================= */

.review-enter-active,
.review-leave-active {
  transition:
    opacity 350ms ease,
    transform 350ms ease;
}


.review-enter-from {
  opacity: 0;

  transform: translateX(35px);
}


.review-leave-to {
  opacity: 0;

  transform: translateX(-35px);
}


/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 640px) {

  .reviews-container {
    padding-top: 80px;

    padding-bottom: 80px;
  }


  .reviews-heading {
    margin-bottom: 40px;
  }


  .review-slider {
    min-height: 330px;
  }


  .review-card {
    padding: 0 42px;
  }


  .review-card blockquote {
    font-size: 1.7rem;
  }


  .review-arrow {
    width: 34px;

    height: 34px;

    font-size: 0.85rem;
  }


  .review-arrow-left {
    left: 0;
  }


  .review-arrow-right {
    right: 0;
  }

}
</style>