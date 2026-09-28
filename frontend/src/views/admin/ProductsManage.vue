<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import api from "../../api/axios";

const products = ref([]);
const loading = ref(true);

const importing = ref(false);
const importError = ref("");
const importSuccess = ref("");

const load = async () => {
  loading.value = true;

  try {
    const { data } = await api.get("/products/admin");
    products.value = data;
  } catch (err) {
    console.error("Failed to load products:", err);
  } finally {
    loading.value = false;
  }
};

const remove = async (product) => {
  if (!confirm(`Delete "${product.name}"? This can't be undone.`)) {
    return;
  }

  try {
    await api.delete(`/products/${product._id}`);
    await load();
  } catch (err) {
    alert(
      err.response?.data?.message ||
        "Failed to delete product."
    );
  }
};

const toggleActive = async (product) => {
  try {
    await api.put(`/products/${product._id}`, {
      isActive: !product.isActive,
    });

    await load();
  } catch (err) {
    alert(
      err.response?.data?.message ||
        "Failed to update product."
    );
  }
};

/* =========================================
   EXCEL IMPORT
   ========================================= */

const importExcel = async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  importing.value = true;
  importError.value = "";
  importSuccess.value = "";

  try {
    const formData = new FormData();

    formData.append("file", file);

    const { data } = await api.post(
      "/products/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    importSuccess.value =
      data.message ||
      "Products imported successfully.";

    await load();
  } catch (err) {
    console.error("Excel import error:", err);

    importError.value =
      err.response?.data?.message ||
      "Failed to import Excel file.";
  } finally {
    importing.value = false;

    // Allows the same file to be selected again
    event.target.value = "";
  }
};

onMounted(load);
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="head">
      <h1>Products</h1>

      <div class="head-actions">
        <!-- IMPORT EXCEL -->
        <label
          class="btn btn-secondary import-btn"
          :class="{ disabled: importing }"
        >
          {{ importing ? "Importing..." : "Import Excel" }}

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            :disabled="importing"
            @change="importExcel"
          />
        </label>

        <!-- ADD PRODUCT -->
        <RouterLink
          :to="{ name: 'admin-product-new' }"
          class="btn btn-primary"
        >
          Add product
        </RouterLink>
      </div>
    </div>

    <!-- IMPORT ERROR -->
    <div
      v-if="importError"
      class="import-message import-error"
    >
      {{ importError }}
    </div>

    <!-- IMPORT SUCCESS -->
    <div
      v-if="importSuccess"
      class="import-message import-success"
    >
      {{ importSuccess }}
    </div>

    <!-- LOADING -->
    <p v-if="loading">
      Loading…
    </p>

    <!-- PRODUCTS -->
    <table
      v-else
      class="panel table"
    >
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="p in products"
          :key="p._id"
        >
          <td>
            {{ p.name }}
          </td>

          <td>
            {{ p.category }}
          </td>

          <td>
            Rs {{ Number(p.price || 0).toLocaleString() }}
          </td>

          <td
            :class="{
              low: p.totalStock <= 5,
            }"
          >
            {{ p.totalStock }}
          </td>

          <td>
            <button
              class="btn-text"
              @click="toggleActive(p)"
            >
              {{ p.isActive ? "Live" : "Hidden" }}
            </button>
          </td>

          <td class="actions">
            <RouterLink
              :to="{
                name: 'admin-product-edit',
                params: {
                  id: p._id,
                },
              }"
              class="btn-text"
            >
              Edit
            </RouterLink>

            <button
              class="btn-text remove"
              @click="remove(p)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.import-btn {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.import-btn.disabled {
  opacity: 0.55;
  cursor: wait;
}

.import-message {
  margin-bottom: 18px;
  padding: 12px 15px;
  border: 1px solid var(--color-line);
  font-size: 0.85rem;
}

.import-error {
  color: var(--color-error);
  background: rgba(166, 61, 47, 0.04);
}

.import-success {
  color: #287a45;
  background: rgba(40, 122, 69, 0.05);
}

.table {
  width: 100%;
  border-collapse: collapse;
  padding: 0;
}

.table th,
.table td {
  text-align: left;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-line);
  font-size: 0.9rem;
}

.table th {
  color: var(--color-ink-soft);
  font-weight: 500;
}

.low {
  color: var(--color-rose);
}

.actions {
  display: flex;
  gap: 14px;
}

.remove {
  color: var(--color-error);
}

@media (max-width: 700px) {
  .head {
    align-items: flex-start;
    flex-direction: column;
    gap: 15px;
  }

  .head-actions {
    width: 100%;
  }

  .head-actions .btn {
    flex: 1;
    text-align: center;
  }

  .table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
