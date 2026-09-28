<script setup>
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const logout = () => {
  auth.logout();
  router.push({ name: "admin-login" });
};
</script>

<template>
  <div class="admin-shell">

    <!-- SIDEBAR -->
    <aside class="sidebar">

      <div class="sidebar-top">
        <RouterLink to="/" class="wordmark">
          Threads
        </RouterLink>

        <p class="admin-tag">
          Admin
        </p>
      </div>

      <nav class="side-nav">

        <RouterLink :to="{ name: 'admin-dashboard' }">
          Dashboard
        </RouterLink>

        <RouterLink :to="{ name: 'admin-products' }">
          Products
        </RouterLink>

        <RouterLink :to="{ name: 'admin-orders' }">
          Orders
        </RouterLink>

        <RouterLink :to="{ name: 'admin-reviews' }">
          Reviews
        </RouterLink>

      </nav>

      <div class="sidebar-bottom">

        <RouterLink to="/" class="view-store">
          View store
          <span>→</span>
        </RouterLink>

        <button
          type="button"
          class="btn-text logout"
          @click="logout"
        >
          Sign out
        </button>

      </div>

    </aside>

    <!-- CONTENT -->
    <main class="admin-content">
      <RouterView />
    </main>

  </div>
</template>

<style scoped>
.admin-shell {
  display: grid;

  grid-template-columns: 220px 1fr;

  min-height: 100vh;

  background: var(--color-paper);
}

/* =========================================
   SIDEBAR
   ========================================= */

.sidebar {
  display: flex;
  flex-direction: column;

  padding: 32px 24px;

  border-right: 1px solid var(--color-line);

  background: var(--color-paper);
}

.sidebar-top {
  margin-bottom: 42px;
}

.wordmark {
  display: inline-block;

  color: var(--color-ink);

  font-family: var(--font-display);
  font-size: 1.7rem;

  letter-spacing: -0.03em;
}

.admin-tag {
  margin-top: 4px;

  color: var(--color-ink-soft);

  font-size: 0.62rem;
  font-weight: 600;

  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* =========================================
   NAVIGATION
   ========================================= */

.side-nav {
  display: flex;
  flex-direction: column;

  gap: 4px;

  flex: 1;
}

.side-nav a {
  position: relative;

  display: flex;
  align-items: center;

  padding: 11px 12px;

  color: var(--color-ink-soft);

  font-size: 0.78rem;

  transition:
    color 180ms ease,
    background 180ms ease;
}

.side-nav a:hover {
  color: var(--color-ink);
  background: var(--color-paper-alt);
}

.side-nav a.router-link-exact-active {
  color: var(--color-accent);

  background: var(--color-paper-alt);
}

.side-nav a.router-link-exact-active::before {
  content: "";

  position: absolute;

  left: 0;
  top: 50%;

  width: 2px;
  height: 18px;

  transform: translateY(-50%);

  background: var(--color-accent);
}

/* =========================================
   SIDEBAR BOTTOM
   ========================================= */

.sidebar-bottom {
  display: flex;
  flex-direction: column;

  gap: 14px;

  padding-top: 24px;

  border-top: 1px solid var(--color-line);
}

.view-store {
  display: flex;
  align-items: center;
  justify-content: space-between;

  color: var(--color-ink-soft);

  font-size: 0.7rem;

  text-transform: uppercase;
  letter-spacing: 0.08em;

  transition: color 180ms ease;
}

.view-store:hover {
  color: var(--color-accent);
}

.view-store span {
  font-size: 1rem;
}

.logout {
  align-self: flex-start;

  padding: 0;

  color: var(--color-error);

  font-size: 0.7rem;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* =========================================
   CONTENT
   ========================================= */

.admin-content {
  min-width: 0;

  padding: 40px 48px;
}

/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 720px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: relative;

    border-right: none;
    border-bottom: 1px solid var(--color-line);

    padding: 18px 20px;
  }

  .sidebar-top {
    margin-bottom: 16px;
  }

  .side-nav {
    flex-direction: row;

    gap: 4px;

    overflow-x: auto;

    padding-bottom: 2px;

    scrollbar-width: none;
  }

  .side-nav::-webkit-scrollbar {
    display: none;
  }

  .side-nav a {
    flex-shrink: 0;

    padding: 9px 11px;

    white-space: nowrap;
  }

  .side-nav a.router-link-exact-active::before {
    left: 50%;
    bottom: 0;
    top: auto;

    width: 18px;
    height: 2px;

    transform: translateX(-50%);
  }

  .sidebar-bottom {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    margin-top: 14px;
    padding-top: 14px;
  }

  .admin-content {
    padding: 28px 20px;
  }
}
</style>
