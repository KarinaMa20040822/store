<script setup lang="ts">
import { useProductStore } from '@/store/productStore'

const productStore = useProductStore()
</script>

<template>
  <div>
    <h1>商品管理系統</h1>
    <router-view />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
