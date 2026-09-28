<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../api/axios";

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);

const form = reactive({
  barcode: "",
  name: "",
  description: "",
  category: "women-unstitched",
  price: 0,
  compareAtPrice: null,
  totalStock: 0,
  isFeatured: false,
  isActive: true,
  images: [],
  variants: [],
});

const loading = ref(false);
const saving = ref(false);
const error = ref("");
const uploading = ref(false);

const categories = [
  "women-unstitched",
  "women-stitched",
  "girls",
  "boys",
  "accessories",
];

const useVariants = ref(false);

const addVariant = () => {
  form.variants.push({ size: "", color: "", stock: 0 });
};

const removeVariant = (index) => {
  form.variants.splice(index, 1);
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  uploading.value = true;
  error.value = "";
  try {
    const fd = new FormData();
    fd.append("image", file);
    const { data } = await api.post("/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    form.images.push({ url: data.url, publicId: data.publicId });
  } catch (err) {
    error.value = "Image upload failed. Check your Cloudinary setup.";
  } finally {
    uploading.value = false;
    event.target.value = "";
  }
};

const removeImage = async (index) => {
  const image = form.images[index];
  form.images.splice(index, 1);
  if (image.publicId) {
    try {
      await api.delete(`/upload/${encodeURIComponent(image.publicId)}`);
    } catch {
      // ignore - orphaned Cloudinary asset isn't critical
    }
  }
};

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    const { data } = await api.get(`/products/${route.params.id}`);
    Object.assign(form, data);
    useVariants.value = data.variants?.length > 0;
    loading.value = false;
  }
});

const submit = async () => {
  error.value = "";
  saving.value = true;
  try {
    if (!useVariants.value) form.variants = [];
    const payload = { ...form };
    if (isEdit.value) {
      await api.put(`/products/${route.params.id}`, payload);
    } else {
      await api.post("/products", payload);
    }
    router.push({ name: "admin-products" });
  } catch (err) {
    error.value = err.response?.data?.message || "Couldn't save this product.";
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="form-page">
    <h1>{{ isEdit ? "Edit product" : "Add product" }}</h1>

    <p v-if="loading">Loading…</p>
    <form v-else class="panel" @submit.prevent="submit">
      <div class="field-row">
        <div class="field">
          <label>Barcode</label>
          <input v-model="form.barcode" required />
        </div>
        <div class="field">
          <label>Category</label>
          <select v-model="form.category">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>Name</label>
        <input v-model="form.name" required />
      </div>

      <div class="field">
        <label>Description</label>
        <textarea v-model="form.description" rows="3"></textarea>
      </div>

      <div class="field-row">
        <div class="field">
          <label>Price (Rs)</label>
          <input v-model.number="form.price" type="number" min="0" required />
        </div>
        <div class="field">
          <label>Compare-at price (optional, shows a strikethrough)</label>
          <input v-model.number="form.compareAtPrice" type="number" min="0" />
        </div>
      </div>

      <div class="field">
        <label class="checkbox-label">
          <input type="checkbox" v-model="useVariants" />
          This product has sizes/colors with separate stock counts
        </label>
      </div>

      <div v-if="!useVariants" class="field">
        <label>Total stock</label>
        <input v-model.number="form.totalStock" type="number" min="0" />
      </div>

      <div v-else class="variants">
        <p class="option-label">Variants</p>
        <div v-for="(v, i) in form.variants" :key="i" class="variant-row">
          <input v-model="v.size" placeholder="Size (e.g. M)" />
          <input v-model="v.color" placeholder="Color (optional)" />
          <input v-model.number="v.stock" type="number" min="0" placeholder="Stock" />
          <button type="button" class="btn-text remove" @click="removeVariant(i)">Remove</button>
        </div>
        <button type="button" class="btn-text" @click="addVariant">+ Add variant</button>
      </div>

      <div class="field">
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.isFeatured" />
          Feature on homepage
        </label>
      </div>
      <div class="field">
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.isActive" />
          Visible in the storefront
        </label>
      </div>

      <div class="field">
        <label>Images</label>
        <input type="file" accept="image/*" @change="handleImageUpload" :disabled="uploading" />
        <p v-if="uploading" class="uploading-note">Uploading…</p>
        <div class="image-previews" v-if="form.images.length">
          <div v-for="(img, i) in form.images" :key="img.publicId || i" class="image-preview">
            <img :src="img.url" :alt="`Preview ${i + 1}`" />
            <button type="button" class="btn-text remove" @click="removeImage(i)">Remove</button>
          </div>
        </div>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button class="btn btn-primary" :disabled="saving" type="submit">
        {{ saving ? "Saving…" : isEdit ? "Save changes" : "Create product" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.form-page {
  max-width: 720px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--color-ink);
}

.variants {
  margin-bottom: 20px;
}

.option-label {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  margin-bottom: 10px;
}

.variant-row {
  display: grid;
  grid-template-columns: 1fr 1fr 100px auto;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.variant-row input {
  padding: 9px 10px;
  border: 1px solid var(--color-line);
}

.uploading-note {
  color: var(--color-ink-soft);
  font-size: 0.85rem;
  margin-top: 6px;
}

.image-previews {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.image-preview {
  width: 90px;
  text-align: center;
}

.image-preview img {
  width: 90px;
  height: 110px;
  object-fit: cover;
  border: 1px solid var(--color-line);
  margin-bottom: 4px;
}

.remove {
  color: var(--color-error);
  font-size: 0.8rem;
}
</style>
