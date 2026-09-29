<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../../api/axios";

const router = useRouter();

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

const goToDashboard = () => {
  router.push({
    name: "admin-dashboard",
  });
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

    <!-- =========================================
         PAGE HEADER
         ========================================= -->

    <header class="page-header">

      <div class="header-main">

        <button
          type="button"
          class="back-button"
          @click="goToDashboard"
        >
          <span class="back-arrow">
            ←
          </span>

          <span>
            Back to Dashboard
          </span>
        </button>

        <div class="heading-content">

          <div class="heading-label">
            <span class="heading-line"></span>

            <p class="eyebrow">
              Customer Feedback
            </p>
          </div>

          <h1>
            Reviews
          </h1>

          <p class="page-description">
            Review customer feedback before it appears
            on the Threads website.
          </p>

        </div>

      </div>


      <div class="header-actions">

        <button
          type="button"
          class="btn btn-secondary"
          :disabled="loading"
          @click="fetchReviews"
        >
          <span class="button-icon">
            ↻
          </span>

          {{ loading ? "Refreshing…" : "Refresh" }}
        </button>

        <button
          type="button"
          class="btn btn-primary"
          @click="openAddForm"
        >
          <span class="button-icon">
            +
          </span>

          Add review
        </button>

      </div>

    </header>


    <!-- =========================================
         SUMMARY
         ========================================= -->

    <section class="review-summary">

      <div class="summary-card">

        <div class="summary-icon pending-icon">
          !
        </div>

        <div class="summary-content">

          <span class="summary-label">
            Pending
          </span>

          <strong>
            {{ pendingCount }}
          </strong>

          <span class="summary-description">
            Waiting for approval
          </span>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon approved-icon">
          ✓
        </div>

        <div class="summary-content">

          <span class="summary-label">
            Approved
          </span>

          <strong>
            {{ approvedCount }}
          </strong>

          <span class="summary-description">
            Visible on website
          </span>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon hidden-icon">
          —
        </div>

        <div class="summary-content">

          <span class="summary-label">
            Hidden
          </span>

          <strong>
            {{ hiddenCount }}
          </strong>

          <span class="summary-description">
            Not visible publicly
          </span>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon total-icon">
          #
        </div>

        <div class="summary-content">

          <span class="summary-label">
            Total Reviews
          </span>

          <strong>
            {{ reviews.length }}
          </strong>

          <span class="summary-description">
            All customer feedback
          </span>

        </div>

      </div>

    </section>


    <!-- =========================================
         ERROR
         ========================================= -->

    <div
      v-if="error"
      class="error-message"
    >

      <div class="error-icon">
        !
      </div>

      <div>
        <strong>
          Something went wrong
        </strong>

        <p>
          {{ error }}
        </p>
      </div>

    </div>


    <!-- =========================================
         FILTERS
         ========================================= -->

    <section class="review-toolbar">

      <div class="toolbar-heading">

        <div>
          <span class="toolbar-label">
            Manage feedback
          </span>

          <h2>
            Customer reviews
          </h2>
        </div>

      </div>


      <div class="filters">

        <button
          type="button"
          class="filter"
          :class="{
            active: activeFilter === 'pending'
          }"
          @click="activeFilter = 'pending'"
        >
          <span class="filter-name">
            Pending
          </span>

          <span class="filter-count">
            {{ pendingCount }}
          </span>
        </button>


        <button
          type="button"
          class="filter"
          :class="{
            active: activeFilter === 'approved'
          }"
          @click="activeFilter = 'approved'"
        >
          <span class="filter-name">
            Approved
          </span>

          <span class="filter-count">
            {{ approvedCount }}
          </span>
        </button>


        <button
          type="button"
          class="filter"
          :class="{
            active: activeFilter === 'hidden'
          }"
          @click="activeFilter = 'hidden'"
        >
          <span class="filter-name">
            Hidden
          </span>

          <span class="filter-count">
            {{ hiddenCount }}
          </span>
        </button>


        <button
          type="button"
          class="filter"
          :class="{
            active: activeFilter === 'all'
          }"
          @click="activeFilter = 'all'"
        >
          <span class="filter-name">
            All reviews
          </span>

          <span class="filter-count">
            {{ reviews.length }}
          </span>
        </button>

      </div>

    </section>


    <!-- =========================================
         ADD REVIEW
         ========================================= -->

    <section
      v-if="showAddForm"
      class="add-review panel"
    >

      <div class="form-heading">

        <div>

          <div class="section-kicker">
            Manual review
          </div>

          <h2>
            Add a customer review
          </h2>

          <p>
            Add feedback manually to your review collection.
          </p>

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
            <span>
              Name
            </span>

            <input
              v-model="form.name"
              type="text"
              placeholder="Customer name"
              maxlength="80"
              required
            />
          </label>


          <label>
            <span>
              City
            </span>

            <input
              v-model="form.city"
              type="text"
              placeholder="Rawalpindi"
              maxlength="80"
            />
          </label>

        </div>


        <label>
          <span>
            Rating
          </span>

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
          <span>
            Review
          </span>

          <textarea
            v-model="form.comment"
            placeholder="Write the customer's review..."
            maxlength="500"
            rows="5"
            required
          ></textarea>

          <small>
            {{ form.comment.length }}/500
          </small>

        </label>


        <div class="form-actions">

          <button
            type="button"
            class="btn btn-secondary"
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


    <!-- =========================================
         LOADING
         ========================================= -->

    <section
      v-if="loading"
      class="empty-state panel"
    >

      <div class="loading-spinner"></div>

      <h2>
        Loading reviews
      </h2>

      <p>
        We're getting the latest customer feedback.
      </p>

    </section>


    <!-- =========================================
         EMPTY
         ========================================= -->

    <section
      v-else-if="!filteredReviews.length"
      class="empty-state panel"
    >

      <div class="empty-mark">
        —
      </div>

      <h2>
        No
        <em>
          {{ activeFilter }}
        </em>
        reviews
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


    <!-- =========================================
         REVIEWS
         ========================================= -->

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

          <div class="review-author">

            <div class="avatar">
              {{ review.name?.charAt(0)?.toUpperCase() }}
            </div>

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

          </div>


          <div class="review-meta">

            <span
              class="status"
              :class="`status-${review.status}`"
            >
              <span class="status-dot"></span>

              {{ review.status }}
            </span>

            <span class="review-date">
              {{ formatDate(review.createdAt) }}
            </span>

          </div>

        </div>


        <div class="review-content">

          <span class="quote-mark">
            “
          </span>

          <blockquote>
            {{ review.comment }}
          </blockquote>

        </div>


        <div class="review-actions">

          <button
            v-if="review.status !== 'approved'"
            type="button"
            class="btn btn-primary action-button"
            @click="updateStatus(review, 'approved')"
          >
            ✓
            Approve
          </button>


          <button
            v-if="review.status !== 'hidden'"
            type="button"
            class="btn btn-secondary action-button"
            @click="updateStatus(review, 'hidden')"
          >
            Hide
          </button>


          <button
            v-if="review.status !== 'pending'"
            type="button"
            class="btn btn-secondary action-button"
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

/* =========================================
   PAGE
   ========================================= */

.reviews-page {
  width: 100%;
  max-width: 1180px;

  margin: 0 auto;
}


/* =========================================
   PAGE HEADER
   ========================================= */

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 40px;

  margin-bottom: 42px;

  padding-bottom: 32px;

  border-bottom: 1px solid var(--color-line);
}

.header-main {
  min-width: 0;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 28px;

  padding: 8px 0;

  border: 0;

  background: transparent;

  color: var(--color-ink-soft);

  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.08em;

  cursor: pointer;

  transition:
    color 180ms ease,
    transform 180ms ease;
}

.back-button:hover {
  color: var(--color-accent);

  transform: translateX(-3px);
}

.back-arrow {
  font-size: 1rem;
  line-height: 1;
}

.heading-content {
  display: flex;
  flex-direction: column;
}

.heading-label {
  display: flex;
  align-items: center;
  gap: 10px;

  margin-bottom: 12px;
}

.heading-line {
  width: 28px;
  height: 1px;

  background: var(--color-accent);
}

.eyebrow {
  margin: 0;

  color: var(--color-accent);

  font-size: 0.68rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.page-header h1 {
  margin: 0 0 14px;

  font-size: clamp(3rem, 6vw, 5rem);

  letter-spacing: -0.05em;
  line-height: 0.92;
}

.page-description {
  max-width: 540px;

  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.9rem;
  line-height: 1.7;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;

  flex-shrink: 0;
}


/* =========================================
   BUTTONS
   ========================================= */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  min-height: 42px;

  padding: 0 17px;

  border: 1px solid var(--color-line);

  background: var(--color-paper);

  color: var(--color-ink);

  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.07em;

  cursor: pointer;

  transition:
    background 180ms ease,
    color 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-primary {
  border-color: var(--color-ink);

  background: var(--color-ink);

  color: var(--color-paper);
}

.btn-primary:hover:not(:disabled) {
  border-color: var(--color-accent);

  background: var(--color-accent);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-ink);

  background: var(--color-paper-alt);
}

.button-icon {
  font-size: 1rem;
  line-height: 1;
}


/* =========================================
   SUMMARY
   ========================================= */

.review-summary {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 38px;
}

.summary-card {
  display: flex;
  align-items: center;

  gap: 14px;

  min-height: 105px;

  padding: 18px;

  border: 1px solid var(--color-line);

  background: var(--color-paper-alt);
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  font-size: 0.8rem;
  font-weight: 700;
}

.pending-icon {
  background: rgba(180, 130, 40, 0.12);

  color: #96701f;
}

.approved-icon {
  background: rgba(60, 120, 75, 0.12);

  color: #477653;
}

.hidden-icon {
  background: rgba(100, 100, 100, 0.1);

  color: var(--color-ink-soft);
}

.total-icon {
  background: var(--color-ink);

  color: var(--color-paper);
}

.summary-content {
  display: flex;
  flex-direction: column;

  min-width: 0;
}

.summary-label {
  margin-bottom: 2px;

  color: var(--color-ink-soft);

  font-size: 0.62rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.summary-content strong {
  margin-bottom: 2px;

  font-family: var(--font-display);

  font-size: 1.65rem;

  font-weight: 500;

  line-height: 1;
}

.summary-description {
  color: var(--color-ink-soft);

  font-size: 0.62rem;
}


/* =========================================
   ERROR
   ========================================= */

.error-message {
  display: flex;
  align-items: flex-start;

  gap: 12px;

  margin-bottom: 28px;

  padding: 15px 18px;

  border: 1px solid rgba(150, 50, 50, 0.25);

  background: rgba(150, 50, 50, 0.05);

  color: var(--color-error);
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 22px;
  height: 22px;

  flex-shrink: 0;

  border: 1px solid currentColor;

  border-radius: 50%;

  font-size: 0.65rem;
  font-weight: 700;
}

.error-message strong {
  display: block;

  margin-bottom: 3px;

  font-size: 0.72rem;
}

.error-message p {
  margin: 0;

  font-size: 0.72rem;

  line-height: 1.5;
}


/* =========================================
   TOOLBAR
   ========================================= */

.review-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 25px;

  margin-bottom: 20px;

  border-bottom: 1px solid var(--color-line);
}

.toolbar-heading {
  padding-bottom: 18px;
}

.toolbar-label {
  display: block;

  margin-bottom: 5px;

  color: var(--color-accent);

  font-size: 0.62rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.toolbar-heading h2 {
  margin: 0;

  font-family: var(--font-display);

  font-size: 1.5rem;

  font-weight: 500;

  letter-spacing: -0.025em;
}

.filters {
  display: flex;
  align-items: center;
  gap: 3px;
}

.filter {
  position: relative;

  display: flex;
  align-items: center;
  gap: 7px;

  padding: 13px 12px;

  border: 0;
  border-bottom: 2px solid transparent;

  background: transparent;

  color: var(--color-ink-soft);

  font-family: var(--font-body);

  font-size: 0.65rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.07em;

  cursor: pointer;

  transition:
    color 180ms ease,
    border-color 180ms ease;
}

.filter:hover {
  color: var(--color-ink);
}

.filter.active {
  border-bottom-color: var(--color-accent);

  color: var(--color-ink);
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 20px;
  height: 20px;

  padding: 0 5px;

  border-radius: 10px;

  background: var(--color-paper-alt);

  color: var(--color-ink-soft);

  font-size: 0.58rem;
}

.filter.active .filter-count {
  background: var(--color-accent);

  color: white;
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

  padding: 30px;
}

.form-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 25px;

  margin-bottom: 30px;
}

.section-kicker {
  margin-bottom: 8px;

  color: var(--color-accent);

  font-size: 0.62rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.form-heading h2 {
  margin: 0 0 7px;

  font-family: var(--font-display);

  font-size: 1.8rem;

  font-weight: 500;

  letter-spacing: -0.03em;
}

.form-heading p {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.78rem;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  border: 1px solid var(--color-line);
  border-radius: 50%;

  background: transparent;

  color: var(--color-ink);

  font-size: 1.3rem;

  cursor: pointer;

  transition:
    background 180ms ease,
    color 180ms ease;
}

.close-button:hover {
  background: var(--color-ink);

  color: var(--color-paper);
}

.review-form {
  display: flex;
  flex-direction: column;

  gap: 20px;
}

.form-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 18px;
}

.review-form label {
  display: flex;
  flex-direction: column;

  gap: 8px;
}

.review-form label > span {
  color: var(--color-ink-soft);

  font-size: 0.64rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.review-form input,
.review-form select,
.review-form textarea {
  width: 100%;

  box-sizing: border-box;

  padding: 13px 14px;

  border: 1px solid var(--color-line);

  outline: none;

  background: var(--color-paper);

  color: var(--color-ink);

  font-family: var(--font-body);

  font-size: 0.8rem;

  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.review-form textarea {
  min-height: 130px;

  resize: vertical;
}

.review-form input:focus,
.review-form select:focus,
.review-form textarea:focus {
  border-color: var(--color-accent);

  box-shadow:
    0 0 0 3px rgba(0, 0, 0, 0.03);
}

.review-form label small {
  align-self: flex-end;

  margin-top: -3px;

  color: var(--color-ink-soft);

  font-size: 0.62rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;

  gap: 10px;

  padding-top: 5px;
}


/* =========================================
   EMPTY / LOADING
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
  margin-bottom: 10px;

  color: var(--color-accent-soft);

  font-family: var(--font-display);

  font-size: 4rem;

  line-height: 1;
}

.empty-state h2 {
  margin: 0 0 10px;

  font-family: var(--font-display);

  font-size: 2.2rem;

  font-weight: 500;

  letter-spacing: -0.03em;
}

.empty-state h2 em {
  font-weight: 400;
}

.empty-state p {
  max-width: 420px;

  margin: 0 0 25px;

  color: var(--color-ink-soft);

  font-size: 0.82rem;

  line-height: 1.6;
}

.loading-spinner {
  width: 28px;
  height: 28px;

  margin-bottom: 20px;

  border: 2px solid var(--color-line);

  border-top-color: var(--color-accent);

  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =========================================
   REVIEW LIST
   ========================================= */

.review-list {
  display: flex;
  flex-direction: column;

  gap: 14px;
}

.review-card {
  padding: 25px;

  transition:
    border-color 180ms ease,
    transform 180ms ease;
}

.review-card:hover {
  border-color: rgba(0, 0, 0, 0.18);

  transform: translateY(-1px);
}

.review-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 25px;

  margin-bottom: 22px;
}

.review-author {
  display: flex;
  align-items: flex-start;

  gap: 13px;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  flex-shrink: 0;

  border-radius: 50%;

  background: var(--color-ink);

  color: var(--color-paper);

  font-family: var(--font-display);

  font-size: 1rem;
}

.review-stars {
  display: flex;

  gap: 3px;

  margin-bottom: 7px;

  font-size: 0.72rem;

  color: var(--color-line);
}

.review-stars .filled {
  color: var(--color-accent);
}

.review-card h3 {
  margin: 0 0 3px;

  font-family: var(--font-body);

  font-size: 0.9rem;
  font-weight: 600;
}

.review-city {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.68rem;
}

.review-meta {
  display: flex;
  align-items: flex-end;
  flex-direction: column;

  gap: 7px;
}

.status {
  display: inline-flex;
  align-items: center;

  gap: 6px;

  padding: 5px 9px;

  font-size: 0.56rem;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: currentColor;
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

  font-size: 0.63rem;
}


/* =========================================
   REVIEW CONTENT
   ========================================= */

.review-content {
  position: relative;

  display: flex;

  gap: 15px;

  margin-bottom: 23px;

  padding-left: 5px;
}

.quote-mark {
  color: var(--color-accent);

  font-family: var(--font-display);

  font-size: 3.5rem;

  line-height: 0.7;
}

.review-card blockquote {
  max-width: 820px;

  margin: 0;

  padding-top: 5px;

  color: var(--color-ink);

  font-family: var(--font-display);

  font-size: clamp(1.2rem, 2.3vw, 1.65rem);

  font-weight: 400;

  line-height: 1.35;

  letter-spacing: -0.02em;
}


/* =========================================
   REVIEW ACTIONS
   ========================================= */

.review-actions {
  display: flex;
  align-items: center;

  gap: 8px;

  padding-top: 17px;

  border-top: 1px solid var(--color-line);
}

.action-button {
  min-height: 36px;

  padding: 0 13px;

  font-size: 0.61rem;
}

.delete-button {
  margin-left: auto;

  padding: 8px 0;

  border: 0;

  background: transparent;

  color: var(--color-error);

  font-family: var(--font-body);

  font-size: 0.63rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.08em;

  cursor: pointer;

  transition: opacity 180ms ease;
}

.delete-button:hover {
  opacity: 0.7;
}


/* =========================================
   TABLET
   ========================================= */

@media (max-width: 950px) {

  .review-summary {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .page-header {
    align-items: flex-start;

    flex-direction: column;

    gap: 25px;
  }

  .header-actions {
    width: 100%;
  }

}


/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 700px) {

  .reviews-page {
    width: 100%;
  }


  .page-header {
    gap: 22px;

    margin-bottom: 30px;

    padding-bottom: 25px;
  }


  .back-button {
    margin-bottom: 23px;
  }


  .page-header h1 {
    font-size: 3rem;
  }


  .page-description {
    font-size: 0.8rem;
  }


  .header-actions {
    width: 100%;
  }


  .header-actions .btn {
    flex: 1;
  }


  .review-summary {
    grid-template-columns: 1fr 1fr;

    gap: 8px;

    margin-bottom: 30px;
  }


  .summary-card {
    min-height: 90px;

    padding: 13px;

    gap: 10px;
  }


  .summary-icon {
    width: 32px;
    height: 32px;
  }


  .summary-content strong {
    font-size: 1.35rem;
  }


  .summary-description {
    display: none;
  }


  .review-toolbar {
    display: block;

    margin-bottom: 18px;
  }


  .toolbar-heading {
    padding-bottom: 12px;
  }


  .filters {
    overflow-x: auto;

    scrollbar-width: none;

    border-top: 1px solid var(--color-line);
  }


  .filters::-webkit-scrollbar {
    display: none;
  }


  .filter {
    flex-shrink: 0;

    padding: 12px 10px;
  }


  .form-grid {
    grid-template-columns: 1fr;
  }


  .add-review {
    padding: 20px;
  }


  .review-card {
    padding: 19px;
  }


  .review-card-top {
    flex-direction: column;

    gap: 17px;
  }


  .review-meta {
    align-items: flex-start;
  }


  .review-content {
    gap: 8px;
  }


  .quote-mark {
    font-size: 2.8rem;
  }


  .review-card blockquote {
    font-size: 1.2rem;
  }


  .review-actions {
    flex-wrap: wrap;
  }


  .action-button {
    flex: 1;
  }


  .delete-button {
    width: 100%;

    margin-left: 0;

    padding-top: 10px;

    text-align: left;
  }

}


/* =========================================
   SMALL MOBILE
   ========================================= */

@media (max-width: 430px) {

  .review-summary {
    grid-template-columns: 1fr;
  }


  .summary-card {
    min-height: 76px;
  }


  .summary-description {
    display: block;
  }


  .header-actions {
    flex-direction: column;
  }


  .header-actions .btn {
    width: 100%;
  }


  .review-actions {
    flex-direction: column;

    align-items: stretch;
  }


  .action-button {
    width: 100%;
  }

}

</style>
