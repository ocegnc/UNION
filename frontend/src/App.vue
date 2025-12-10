<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <RouterLink to="/" class="home-btn">Accueil</RouterLink>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
header {
  width: 100%;
  padding: 8px 12px;
  box-sizing: border-box;
}

/* Bouton Accueil */
.home-btn {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
  text-decoration: none;
  color: #333;
  background-color: #f0f0f0;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.home-btn:hover {
  background-color: #e0e0e0;
}

</style>
