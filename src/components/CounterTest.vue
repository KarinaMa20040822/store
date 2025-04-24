<script setup lang="ts">
import { useCounterStore } from '@/stores/counter' // 匯入 store

const counter = useCounterStore() // 呼叫 store
</script>

<template>
  <div>
    <h2>Pinia 測試元件</h2>
    <p>目前數量：{{ counter.count }}</p>
    <button @click="counter.increment">+1</button>
  </div>
</template>
