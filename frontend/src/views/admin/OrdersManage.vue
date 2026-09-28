<script setup>
import { ref, onMounted } from "vue";
import api from "../../api/axios";

const orders = ref([]);
const loading = ref(true);
const statusFilter = ref("");

const statuses = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];

const load = async () => {
  loading.value = true;
  const { data } = await api.get("/orders", {
    params: statusFilter.value ? { status: statusFilter.value } : {},
  });
  orders.value = data;
  loading.value = false;
};

const updateStatus = async (order, status) => {
  await api.put(`/orders/${order._id}/status`, { status });
  order.status = status;
};

onMounted(load);
</script>

<template>
  <div>
    <div class="head">
      <h1>Orders</h1>
      <select v-model="statusFilter" @change="load">
        <option value="">All statuses</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <p v-if="loading">Loading…</p>
    <p v-else-if="!orders.length">No orders yet.</p>

    <div v-else class="orders">
      <div v-for="order in orders" :key="order._id" class="panel order-card">
        <div class="order-head">
          <div>
            <p class="order-number">{{ order.orderNumber }}</p>
            <p class="order-meta">{{ new Date(order.createdAt).toLocaleString() }}</p>
          </div>
          <div class="order-total">Rs {{ order.total.toLocaleString() }}</div>
        </div>

        <p class="customer">
          {{ order.customer.name }} · {{ order.customer.phone }} · {{ order.customer.address }}, {{ order.customer.city }}
        </p>

        <ul class="items">
          <li v-for="(item, i) in order.items" :key="i">
            {{ item.name }} <span v-if="item.size">({{ item.size }}<span v-if="item.color">, {{ item.color }}</span>)</span>
            × {{ item.quantity }}
          </li>
        </ul>

        <div class="order-footer">
          <span class="badge">{{ order.paymentMethod === "cod" ? "Cash on delivery" : "Card" }}</span>
          <span class="badge" :class="{ 'badge-rose': order.paymentStatus !== 'paid' }">{{ order.paymentStatus }}</span>
          <select :value="order.status" @change="updateStatus(order, $event.target.value)">
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.head select {
  padding: 9px 12px;
  border: 1px solid var(--color-line);
  background: var(--color-white);
}

.orders {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.order-number {
  font-family: var(--font-display);
  font-size: 1.1rem;
}

.order-meta {
  color: var(--color-ink-soft);
  font-size: 0.82rem;
}

.order-total {
  font-family: var(--font-display);
  font-size: 1.1rem;
}

.customer {
  font-size: 0.88rem;
  color: var(--color-ink-soft);
  margin-bottom: 12px;
}

.items {
  margin: 0 0 14px;
  padding-left: 18px;
  font-size: 0.88rem;
}

.order-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.order-footer select {
  padding: 6px 10px;
  border: 1px solid var(--color-line);
  font-size: 0.85rem;
}
</style>
