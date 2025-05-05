<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useProductStore } from "@/store/productStore";

const router = useRouter();
const store = useProductStore();

const productList = computed(() => {
  const variants = store.variants;
  const specs = store.specs;
  const colorTitle = specs[0]?.title || "";

  if (variants.length === 0) return [];

  const firstVariant = variants[0];
  const colorName = firstVariant.specs[colorTitle];

  return [
    {
      id: 1,
      name: store.product?.name || "未命名商品",
      price: firstVariant.price,
      image: firstVariant.image,
      description: `顏色：${colorName}`,
    },
  ];
});

function goToProductPage() {
  router.push("/productpage");
}

function goToSpecManagement() {
  router.push("/specsmanagement");
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = "https://via.placeholder.com/200x200?text=商品圖片";
}
</script>

<template>
  <div class="page-title">
    <h2>首頁</h2>
  </div>
  <div class="specmanagement-button-wrapper">
    <button class="specmanagement-button" @click="goToSpecManagement">
      規格管理頁面
    </button>
  </div>

  <div class="products-grid">
    <div
      v-for="product in productList"
      :key="product.id"
      class="product-card"
      @click="goToProductPage"
    >
      <div class="product-image">
        <img
          :src="product.image"
          :alt="product.name"
          @error="handleImageError"
          style="width: 100%; height: 100%; object-fit: cover"
        />
      </div>
      <div class="product-info">
        <h3>{{ product.name }}</h3>
        <div class="product-footer">
          <span class="price">NT$ {{ product.price }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  background-color: #f0f0f0;
}
.page-title {
  text-align: center;
}
.specmanagement-button-wrapper {
  display: flex;
  justify-content: flex-end;
  margin: 10px 20px;
}

.specmanagement-button {
  background-color: #e48a52;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.specmanagement-button:hover {
  background-color: #ca5609;
}

.specmanagement {
  align-items: center;
}
.products-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background-color: #fff;
  transition: box-shadow 0.3s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 200px;
  background-color: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.product-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #e53935;
  font-weight: bold;
}

.no-products {
  text-align: center;
  color: #aaa;
  margin-top: 2rem;
}
</style>
