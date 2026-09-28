<script setup>
import { RouterView, useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";

const route = useRoute();
</script>

<template>
  <template v-if="route.path.startsWith('/admin')">
    <RouterView />
  </template>
  <template v-else>
    <NavBar />
    <main>
      <RouterView />
    </main>
    <Footer />
  </template>
</template>
