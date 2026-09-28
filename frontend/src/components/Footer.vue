<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <footer class="footer">
    <div class="container footer-main">
      <div class="brand">
        <RouterLink to="/" class="wordmark">
          Threads
        </RouterLink>

        <p>
          Thoughtfully chosen clothing for women
          and little ones.
        </p>

        <p class="location">
          Bahria Phase 8<br />
          Rawalpindi, Pakistan
        </p>
      </div>

      <div class="footer-column">
        <p class="footer-label">Shop</p>

        <RouterLink to="/shop?category=women-unstitched">
          Women's Unstitched
        </RouterLink>

        <RouterLink to="/shop?category=women-stitched">
          Women's Stitched
        </RouterLink>

        <RouterLink to="/shop?category=girls">
          Girls
        </RouterLink>

        <RouterLink to="/shop?category=boys">
          Boys
        </RouterLink>

        <RouterLink to="/shop">
          All Products
        </RouterLink>
      </div>

      <div class="footer-column">
        <p class="footer-label">Help</p>

        <RouterLink to="/cart">
          Your Bag
        </RouterLink>

        <RouterLink to="/checkout">
          Checkout
        </RouterLink>

        <a href="mailto:hello@threads.pk">
          Contact us
        </a>
      </div>
    </div>

    <div class="container footer-bottom">
      <span>© {{ new Date().getFullYear() }} Threads</span>
      <span>Made in Pakistan</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 40px;
  border-top: 1px solid var(--color-line);
  background: var(--color-paper-alt);
}

.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;

  padding-top: 42px;
  padding-bottom: 38px;
}

.brand {
  max-width: 300px;
}

.wordmark {
  display: inline-block;
  margin-bottom: 10px;

  font-family: var(--font-display);
  font-size: 1.8rem;
  letter-spacing: -0.02em;
}

.brand p {
  margin-bottom: 8px;

  color: var(--color-ink-soft);
  font-size: 0.8rem;
  line-height: 1.6;
}

.brand .location {
  margin-top: 16px;

  color: var(--color-ink);
  font-size: 0.72rem;
  line-height: 1.5;
}

.footer-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}

.footer-column a {
  color: var(--color-ink-soft);
  font-size: 0.78rem;

  transition: color 0.15s ease;
}

.footer-column a:hover {
  color: var(--color-accent);
}

.footer-label {
  margin: 0 0 7px;

  color: var(--color-ink);

  font-size: 0.65rem;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-top: 15px;
  padding-bottom: 17px;

  border-top: 1px solid var(--color-line);

  color: var(--color-ink-soft);

  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@media (max-width: 700px) {
  .footer-main {
    grid-template-columns: 1fr 1fr;
    gap: 30px 24px;

    padding-top: 32px;
    padding-bottom: 28px;
  }

  .brand {
    grid-column: 1 / -1;
    max-width: 280px;
  }

  .wordmark {
    font-size: 1.6rem;
    margin-bottom: 7px;
  }

  .brand p {
    font-size: 0.76rem;
  }

  .footer-bottom {
    font-size: 0.58rem;
  }
}

@media (max-width: 420px) {
  .footer-main {
    grid-template-columns: 1fr 1fr;
    gap: 26px 18px;
  }

  .footer-column a {
    font-size: 0.74rem;
  }
}
</style>
