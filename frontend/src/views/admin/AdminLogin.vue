<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const submit = async () => {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push({ name: "admin-dashboard" });
  } catch (err) {
    error.value = err.response?.data?.message || "Login failed.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <form class="panel login-form" @submit.prevent="submit">
      <p class="wordmark">Threads</p>
      <p class="subtitle">Admin panel</p>

      <div class="field">
        <label>Email</label>
        <input v-model="email" type="email" required autofocus />
      </div>
      <div class="field">
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button class="btn btn-primary btn-block" :disabled="loading" type="submit">
        {{ loading ? "Signing in…" : "Sign in" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-paper);
}

.login-form {
  width: 360px;
}

.wordmark {
  font-family: var(--font-display);
  font-size: 1.6rem;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--color-ink-soft);
  margin-bottom: 24px;
}
</style>
