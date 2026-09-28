<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../../api/axios";

const reviews = ref([]);
const loading = ref(true);
const error = ref("");
const activeFilter = ref("pending");

const showAddForm = ref(false);
const saving = ref(false);

const form = ref({
  name: "",
  city: "",
  rating: 5,
  comment: "",
});

const fetchReviews = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await api.get("/reviews/admin");

    reviews.value = data.reviews || data || [];
  } catch (err) {
    console.error(err);

    error.value =
      err.response?.data?.message ||
      "We couldn't load the reviews.";
  } finally {
    loading.value = false;
  }
};

const filteredReviews = computed(() => {
  if (activeFilter.value === "all") {
    return reviews.value;
  }

  return reviews.value.filter(
    (review) => review.status === activeFilter.value
  );
});

const pendingCount = computed(() => {
  return reviews.value.filter(
    (review) => review.status === "pending"
  ).length;
});

const approvedCount = computed(() => {
  return reviews.value.filter(
    (review) => review.status === "approved"
  ).length;
});

const hiddenCount = computed(() => {
  return reviews.value.filter(
    (review) => review.status === "hidden"
  ).length;
});

const updateStatus = async (review, status) => {
  try {
    const { data } = await api.put(
      `/reviews/${review._id}/status`,
      {
        status,
      }
    );

    const index = reviews.value.findIndex(
      (item) => item._id === review._id
    );

    if (index !== -1) {
      reviews.value[index] = data;
    }
  } catch (err) {
    console.error(err);

    error.value =
      err.response?.data?.message ||
      "We couldn't update the review.";
  }
};

const deleteReview = async (review) => {
  const confirmed = window.confirm(
    "Delete this review permanently?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/reviews/${review._id}`);

    reviews.value = reviews.value.filter(
      (item) => item._id !== review._id
    );
  } catch (err) {
    console.error(err);

    error.value =
      err.response?.data?.message ||
      "We couldn't delete the review.";
  }
};

const resetForm = () => {
  form.value = {
    name: "",
    city: "",
    rating: 5,
    comment: "",
  };
};

const openAddForm = () => {
  resetForm();
  showAddForm.value = true;
};

const closeAddForm = () => {
  if (saving.value) {
    return;
  }

  showAddForm.value = false;
  resetForm();
};

const addReview = async () => {
  if (
    !form.value.name.trim() ||
    !form.value.comment.trim()
  ) {
    return;
  }

  saving.value = true;
  error.value = "";

  try {
    const { data } = await api.post("/reviews", {
      name: form.value.name.trim(),
      city: form.value.city.trim(),
      rating: Number(form.value.rating),
      comment: form.value.comment.trim(),
    });

    reviews.value.unshift(data);

    showAddForm.value = false;
    resetForm();

    activeFilter.value = "pending";
  } catch (err) {
    console.error(err);

    error.value =
      err.response?.data?.message ||
      "We couldn't add the review.";
  } finally {
    saving.value = false;
  }
};

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString(
    "en-PK",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

onMounted(() => {
  fetchReviews();
});
</script>

<template>
  <div class="reviews-page">

    <!-- PAGE HEADER -->

    <header class="page-header">

      <div>
        <p class="eyebrow">
          Customer feedback
        </p>

        <h1>Reviews</h1>

        <p class="page-description">
          Review customer feedback before it appears
          on the Threads website.
        </p>
      </div>

      <div class="header-actions">

        <button
          type="button"
          class="btn"
          :disabled="loading"
          @click="fetchReviews"
        >
          {{ loading ? "Refreshing…" : "Refresh" }}
        </button>

        <button
          type="button"
          class="btn btn-primary"
          @click="openAddForm"
        >
          Add review
        </button>

      </div>

    </header>


    <!-- ERROR -->

    <div
      v-if="error"
      class="error-message"
    >
      {{ error }}
    </div>


    <!-- FILTERS -->

    <section class="review-toolbar">

      <div class="filters">

        <button
          type="button"
          class="filter"
          :class="{ active: activeFilter === 'pending' }"
          @click="activeFilter = 'pending'"
        >
          Pending

          <span>
            {{ pendingCount }}
          </span>
        </button>

        <button
          type="button"
          class="filter"
          :class="{ active: activeFilter === 'approved' }"
          @click="activeFilter = 'approved'"
        >
          Approved

          <span>
            {{ approvedCount }}
          </span>
        </button>

        <button
          type="button"
          class="filter"
          :class="{ active: activeFilter === 'hidden' }"
          @click="activeFilter = 'hidden'"
        >
          Hidden

          <span>
            {{ hiddenCount }}
          </span>
        </button>

        <button
          type="button"
          class="filter"
          :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          All

          <span>
            {{ reviews.length }}
          </span>
        </button>

      </div>

    </section>


    <!-- ADD REVIEW -->

    <section
      v-if="showAddForm"
      class="add-review panel"
    >

      <div class="form-heading">

        <div>
          <p class="section-kicker">
            Manual review
          </p>

          <h2>Add a customer review</h2>
        </div>

        <button
          type="button"
          class="close-button"
          @click="closeAddForm"
        >
          ×
        </button>

      </div>


      <form
        class="review-form"
        @submit.prevent="addReview"
      >

        <div class="form-grid">

          <label>
            <span>Name</span>

            <input
              v-model="form.name"
              type="text"
              placeholder="Customer name"
              maxlength="80"
              required
            />
          </label>


          <label>
            <span>City</span>

            <input
              v-model="form.city"
              type="text"
              placeholder="Rawalpindi"
              maxlength="80"
            />
          </label>

        </div>


        <label>
          <span>Rating</span>

          <select v-model="form.rating">
            <option :value="5">
              5 stars
            </option>

            <option :value="4">
              4 stars
            </option>

            <option :value="3">
              3 stars
            </option>

            <option :value="2">
              2 stars
            </option>

            <option :value="1">
              1 star
            </option>
          </select>
        </label>


        <label>
          <span>Review</span>

          <textarea
            v-model="form.comment"
            placeholder="Write the customer's review..."
            maxlength="500"
            rows="5"
            required
          ></textarea>
        </label>


        <div class="form-actions">

          <button
            type="button"
            class="btn"
            @click="closeAddForm"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="saving"
          >
            {{ saving ? "Saving…" : "Add review" }}
          </button>

        </div>

      </form>

    </section>


    <!-- LOADING -->

    <section
      v-if="loading"
      class="empty-state"
    >
      <p>Loading reviews…</p>
    </section>


    <!-- EMPTY -->

    <section
      v-else-if="!filteredReviews.length"
      class="empty-state panel"
    >

      <div class="empty-mark">
        —
      </div>

      <h2>
        No
        <em>{{ activeFilter }}</em>
        reviews.
      </h2>

      <p>
        Customer reviews will appear here when
        they are submitted.
      </p>

      <button
        type="button"
        class="btn btn-primary"
        @click="openAddForm"
      >
        Add a review
      </button>

    </section>


    <!-- REVIEWS -->

    <section
      v-else
      class="review-list"
    >

      <article
        v-for="review in filteredReviews"
        :key="review._id"
        class="review-card panel"
      >

        <div class="review-card-top">

          <div>

            <div class="review-stars">

              <span
                v-for="star in 5"
                :key="star"
                :class="{
                  filled:
                    star <= Number(review.rating)
                }"
              >
                ★
              </span>

            </div>

            <h3>
              {{ review.name }}
            </h3>

            <p
              v-if="review.city"
              class="review-city"
            >
              {{ review.city }}
            </p>

          </div>


          <div class="review-meta">

            <span
              class="status"
              :class="`status-${review.status}`"
            >
              {{ review.status }}
            </span>

            <span class="review-date">
              {{ formatDate(review.createdAt) }}
            </span>

          </div>

        </div>


        <blockquote>
          “{{ review.comment }}”
        </blockquote>


        <div class="review-actions">

          <button
            v-if="review.status !== 'approved'"
            type="button"
            class="btn btn-primary"
            @click="updateStatus(review, 'approved')"
          >
            Approve
          </button>

          <button
            v-if="review.status !== 'hidden'"
            type="button"
            class="btn"
            @click="updateStatus(review, 'hidden')"
          >
            Hide
          </button>

          <button
            v-if="review.status !== 'pending'"
            type="button"
            class="btn"
            @click="updateStatus(review, 'pending')"
          >
            Move to pending
          </button>

          <button
            type="button"
            class="delete-button"
            @click="deleteReview(review)"
          >
            Delete
          </button>

        </div>

      </article>

    </section>

  </div>
</template>

<style scoped>

.reviews-page {
  max-width: 1100px;
  margin: 0 auto;
}


/* =========================================
   HEADER
   ========================================= */

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 40px;

  margin-bottom: 42px;
}

.eyebrow {
  margin-bottom: 10px;

  color: var(--color-accent);

  font-size: 0.68rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.page-header h1 {
  margin: 0 0 12px;

  font-size: clamp(3rem, 6vw, 5rem);

  letter-spacing: -0.045em;
  line-height: 0.95;
}

.page-description {
  max-width: 520px;

  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.9rem;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;

  flex-shrink: 0;
}


/* =========================================
   ERROR
   ========================================= */

.error-message {
  margin-bottom: 24px;

  padding: 14px 18px;

  border: 1px solid rgba(150, 50, 50, 0.25);

  background: rgba(150, 50, 50, 0.05);

  color: var(--color-error);

  font-size: 0.8rem;
}


/* =========================================
   TOOLBAR
   ========================================= */

.review-toolbar {
  margin-bottom: 28px;

  border-bottom: 1px solid var(--color-line);
}

.filters {
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter {
  padding: 12px 14px;

  border: 0;
  border-bottom: 2px solid transparent;

  background: transparent;

  color: var(--color-ink-soft);

  font-family: var(--font-body);
  font-size: 0.72rem;

  text-transform: uppercase;
  letter-spacing: 0.08em;

  cursor: pointer;
}

.filter span {
  margin-left: 5px;

  color: var(--color-ink-soft);

  opacity: 0.7;
}

.filter.active {
  border-bottom-color: var(--color-accent);

  color: var(--color-ink);
}


/* =========================================
   PANEL
   ========================================= */

.panel {
  border: 1px solid var(--color-line);

  background: var(--color-paper-alt);
}


/* =========================================
   ADD REVIEW
   ========================================= */

.add-review {
  margin-bottom: 28px;

  padding: 28px;
}

.form-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  margin-bottom: 28px;
}

.section-kicker {
  margin-bottom: 8px;

  color: var(--color-accent);

  font-size: 0.65rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.form-heading h2 {
  margin: 0;

  font-size: 1.7rem;

  letter-spacing: -0.025em;
}

.close-button {
  width: 34px;
  height: 34px;

  border: 1px solid var(--color-line);
  border-radius: 50%;

  background: transparent;

  color: var(--color-ink);

  font-size: 1.3rem;

  cursor: pointer;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.review-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-form label span {
  color: var(--color-ink-soft);

  font-size: 0.68rem;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.review-form input,
.review-form select,
.review-form textarea {
  width: 100%;

  box-sizing: border-box;

  padding: 12px 13px;

  border: 1px solid var(--color-line);

  outline: none;

  background: var(--color-paper);

  color: var(--color-ink);

  font-family: var(--font-body);
  font-size: 0.82rem;
}

.review-form textarea {
  resize: vertical;
  min-height: 120px;
}

.review-form input:focus,
.review-form select:focus,
.review-form textarea:focus {
  border-color: var(--color-accent);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  padding-top: 5px;
}


/* =========================================
   EMPTY
   ========================================= */

.empty-state {
  min-height: 360px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 50px 25px;

  text-align: center;
}

.empty-state.panel {
  border: 1px solid var(--color-line);
}

.empty-mark {
  margin-bottom: 12px;

  color: var(--color-accent-soft);

  font-family: var(--font-display);
  font-size: 4rem;
}

.empty-state h2 {
  margin-bottom: 12px;

  font-size: 2.5rem;
}

.empty-state h2 em {
  font-weight: 400;
}

.empty-state p {
  max-width: 420px;

  margin-bottom: 25px;

  color: var(--color-ink-soft);

  font-size: 0.85rem;
}


/* =========================================
   REVIEW LIST
   ========================================= */

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  padding: 25px;
}

.review-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 25px;
}

.review-stars {
  display: flex;
  gap: 3px;

  margin-bottom: 10px;

  font-size: 0.72rem;

  color: var(--color-line);
}

.review-stars .filled {
  color: var(--color-accent);
}

.review-card h3 {
  margin: 0 0 4px;

  font-size: 1rem;
}

.review-city {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.72rem;
}

.review-meta {
  display: flex;
  align-items: flex-end;
  flex-direction: column;

  gap: 7px;
}

.status {
  padding: 5px 8px;

  font-size: 0.58rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.status-pending {
  background: rgba(180, 130, 40, 0.12);
  color: #96701f;
}

.status-approved {
  background: rgba(60, 120, 75, 0.12);
  color: #477653;
}

.status-hidden {
  background: rgba(100, 100, 100, 0.1);
  color: var(--color-ink-soft);
}

.review-date {
  color: var(--color-ink-soft);

  font-size: 0.65rem;
}

.review-card blockquote {
  max-width: 780px;

  margin: 0 0 25px;

  font-family: var(--font-display);

  font-size: clamp(1.3rem, 3vw, 2rem);

  line-height: 1.25;

  letter-spacing: -0.02em;
}

.review-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  padding-top: 18px;

  border-top: 1px solid var(--color-line);
}

.delete-button {
  margin-left: auto;

  border: 0;

  background: transparent;

  color: var(--color-error);

  font-family: var(--font-body);

  font-size: 0.68rem;

  text-transform: uppercase;
  letter-spacing: 0.08em;

  cursor: pointer;
}


/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 700px) {

  .page-header {
    align-items: flex-start;

    flex-direction: column;

    gap: 22px;

    margin-bottom: 30px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
  }

  .filters {
    overflow-x: auto;

    scrollbar-width: none;
  }

  .filters::-webkit-scrollbar {
    display: none;
  }

  .filter {
    flex-shrink: 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .add-review {
    padding: 20px;
  }

  .review-card {
    padding: 20px;
  }

  .review-card-top {
    flex-direction: column;
  }

  .review-meta {
    align-items: flex-start;
  }

  .review-actions {
    flex-wrap: wrap;
  }

  .delete-button {
    margin-left: 0;
    width: 100%;
    text-align: left;
  }

}

</style>
