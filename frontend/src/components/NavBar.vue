<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useCartStore } from "../stores/cart";

const cart = useCartStore();
const menuOpen = ref(false);

const closeMenu = () => {
  menuOpen.value = false;
};
</script>

<template>
  <header class="nav">
    <div class="container nav-inner">
      <!-- Brand -->
      <RouterLink
        to="/"
        class="wordmark"
        @click="closeMenu"
      >
        Threads
      </RouterLink>

      <!-- Desktop navigation -->
      <nav class="nav-links">
        <RouterLink to="/shop?category=women-unstitched">
          Women
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
      </nav>

      <!-- Desktop bag -->
      <RouterLink to="/cart" class="cart-link desktop-cart">
        Bag

        <span
          v-if="cart.count"
          class="cart-count"
        >
          {{ cart.count }}
        </span>
      </RouterLink>

      <!-- Mobile actions -->
      <div class="mobile-actions">
        <RouterLink to="/cart" class="cart-link">
          Bag

          <span
            v-if="cart.count"
            class="cart-count"
          >
            {{ cart.count }}
          </span>
        </RouterLink>

        <button
          class="menu-button"
          type="button"
          :aria-expanded="menuOpen"
          aria-label="Toggle menu"
          @click="menuOpen = !menuOpen"
        >
          <span
            :class="{ open: menuOpen }"
            class="menu-icon"
          >
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="menu">
      <div v-if="menuOpen" class="mobile-menu">
        <nav class="mobile-menu-links">
          <RouterLink
            to="/shop?category=women-unstitched"
            @click="closeMenu"
          >
            <span>01</span>
            Women
          </RouterLink>

          <RouterLink
            to="/shop?category=girls"
            @click="closeMenu"
          >
            <span>02</span>
            Girls
          </RouterLink>

          <RouterLink
            to="/shop?category=boys"
            @click="closeMenu"
          >
            <span>03</span>
            Boys
          </RouterLink>

          <RouterLink
            to="/shop"
            @click="closeMenu"
          >
            <span>04</span>
            All Products
          </RouterLink>
        </nav>

        <div class="mobile-menu-footer">
          <span>Threads</span>
          <span>Pakistan</span>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.nav {
  border-bottom: 1px solid var(--color-line);

  background: var(--color-paper);

  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-top: 20px;
  padding-bottom: 20px;

  gap: 24px;
}

.wordmark {
  font-family: var(--font-display);

  font-size: 1.5rem;

  letter-spacing: 0.01em;

  flex-shrink: 0;
}

.nav-links {
  display: flex;
  align-items: center;

  gap: 28px;

  font-size: 0.92rem;
}

.nav-links a {
  transition: color 0.15s ease;
}

.nav-links a:hover {
  color: var(--color-accent);
}

.nav-links a.router-link-active {
  color: var(--color-accent);
}

.cart-link {
  font-size: 0.92rem;

  display: flex;
  align-items: center;

  gap: 6px;

  flex-shrink: 0;
}

.cart-count {
  background: var(--color-accent);

  color: var(--color-white);

  font-size: 0.7rem;

  min-width: 18px;
  height: 18px;

  border-radius: 9px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0 4px;
}

/* Mobile controls hidden by default */

.mobile-actions {
  display: none;
}

/* =========================================
   MOBILE MENU
   ========================================= */

.mobile-menu {
  border-top: 1px solid var(--color-line);

  background: var(--color-paper);
}

.mobile-menu-links {
  display: flex;
  flex-direction: column;
}

.mobile-menu-links a {
  display: flex;
  align-items: center;

  gap: 18px;

  padding: 17px var(--gutter);

  border-bottom: 1px solid var(--color-line);

  font-family: var(--font-display);
  font-size: 1.25rem;

  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.mobile-menu-links a:hover,
.mobile-menu-links a.router-link-active {
  color: var(--color-accent);

  background: var(--color-paper-alt);
}

.mobile-menu-links a span {
  width: 22px;

  color: var(--color-ink-soft);

  font-family: var(--font-body);

  font-size: 0.6rem;
  letter-spacing: 0.05em;
}

.mobile-menu-footer {
  display: flex;
  justify-content: space-between;

  padding: 15px var(--gutter);

  color: var(--color-ink-soft);

  font-size: 0.6rem;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* =========================================
   MENU ANIMATION
   ========================================= */

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;

  transform: translateY(-6px);
}

/* =========================================
   HAMBURGER
   ========================================= */

.menu-button {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}

.menu-icon {
  width: 20px;
  height: 14px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-icon span {
  display: block;

  width: 100%;
  height: 1px;

  background: var(--color-ink);

  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.menu-icon.open span:first-child {
  transform: translateY(6.5px) rotate(45deg);
}

.menu-icon.open span:last-child {
  transform: translateY(-6.5px) rotate(-45deg);
}

/* =========================================
   MOBILE BREAKPOINT
   ========================================= */

@media (max-width: 800px) {
  .nav-inner {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .nav-links,
  .desktop-cart {
    display: none;
  }

  .mobile-actions {
    display: flex;
    align-items: center;

    gap: 18px;
  }

  .mobile-actions .cart-link {
    font-size: 0.85rem;
  }
}
</style>
