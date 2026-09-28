<script setup>
import { ref, onMounted } from "vue";
import api from "../../api/axios";

const stats = ref({ productCount: 0, lowStock: 0, ordersToday: 0, pendingOrders: 0 });
const loading = ref(true);

onMounted(async () => {
  try {
    const [productsRes, ordersRes] = await Promise.all([
      api.get("/products/admin"),
      api.get("/orders"),
    ]);
    const products = productsRes.data;
    const orders = ordersRes.data;

    const today = new Date().toDateString();

    stats.value = {
      productCount: products.length,
      lowStock: products.filter((p) => p.totalStock > 0 && p.totalStock <= 5).length,
      ordersToday: orders.filter((o) => new Date(o.createdAt).toDateString() === today).length,
      pendingOrders: orders.filter((o) => o.status === "placed").length,
    };
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p v-if="loading">Loading…</p>
    <div v-else class="stat-grid">
      <div class="panel stat">
        <p class="stat-label">Products</p>
        <p class="stat-value">{{ stats.productCount }}</p>
      </div>
      <div class="panel stat">
        <p class="stat-label">Low stock (≤5)</p>
        <p class="stat-value">{{ stats.lowStock }}</p>
      </div>
      <div class="panel stat">
        <p class="stat-label">Orders today</p>
        <p class="stat-value">{{ stats.ordersToday }}</p>
      </div>
      <div class="panel stat">
        <p class="stat-label">Awaiting confirmation</p>
        <p class="stat-value">{{ stats.pendingOrders }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 28px;
}

.stat-label {
  color: var(--color-ink-soft);
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 2rem;
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
