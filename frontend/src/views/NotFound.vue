<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <section class="container not-found">
    <h1>Page not found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <RouterLink to="/" class="btn btn-primary">Back to Threads</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  padding: 100px 0;
  text-align: left;
}
</style>
