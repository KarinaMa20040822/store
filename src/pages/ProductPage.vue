<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useProductStore } from "@/store/productStore";

const store = useProductStore();

const selectedSpec1 = ref("");
const selectedSpec2 = ref("");
const quantity = ref(1);

const mainImage = ref("");

onMounted(() => {
  console.log("ProductPage 掛載時的 store 資料:", {
    specs: store.specs,
    variants: store.variants,
  });

  if (store.specs.length === 0) {
    const storedData = localStorage.getItem("product-store");
    console.log("從 localStorage 讀取的資料:", storedData);
  }
  if (store.specs.length > 0 && store.specs[0].options.length > 0) {
    mainImage.value = store.specs[0].options[0].image || "";
  }
});

const colorTitle = computed(() => store.specs[0]?.title || "");
const sizeTitle = computed(() => store.specs[1]?.title || "");

const currentVariant = computed(() => {
  if (!selectedSpec1.value) return null;

  if (!sizeTitle.value || !selectedSpec2.value) {
    return store.variants.find(
      (variant) => variant.specs[colorTitle.value] === selectedSpec1.value
    );
  }

  return store.variants.find((variant) => {
    const matchColor = variant.specs[colorTitle.value] === selectedSpec1.value;
    const matchSize = variant.specs[sizeTitle.value] === selectedSpec2.value;
    return matchColor && matchSize;
  });
});

const displayPrice = computed(() => {
  return currentVariant.value
    ? `NT$ ${currentVariant.value.price}`
    : "請選擇規格";
});

const stockLeft = computed(() => {
  return currentVariant.value ? currentVariant.value.stock : 0;
});

function selectSpec1(optionName: string, image?: string) {
  selectedSpec1.value = optionName;
  selectedSpec2.value = "";
  if (image) mainImage.value = image;
}

function selectSpec2(optionName: string) {
  selectedSpec2.value = optionName;
}

function decreaseQuantity() {
  if (quantity.value > 1) quantity.value--;
}

function increaseQuantity() {
  if (quantity.value < stockLeft.value) quantity.value++;
}

function getColorStock(optionName: string) {
  if (!colorTitle.value || store.variants.length === 0) return 0;

  return store.variants
    .filter((variant) => variant.specs[colorTitle.value] === optionName)
    .reduce((total, variant) => total + (variant.stock || 0), 0);
}

function getSizeStock(optionName: string) {
  if (!sizeTitle.value || !selectedSpec1.value || store.variants.length === 0)
    return 0;

  return store.variants
    .filter(
      (variant) =>
        variant.specs[sizeTitle.value] === optionName &&
        variant.specs[colorTitle.value] === selectedSpec1.value
    )
    .reduce((total, variant) => total + (variant.stock || 0), 0);
}

function addToCart() {
  if (!currentVariant.value) {
    alert("請先選擇商品規格");
    return;
  }

  alert(
    `已加入到購物車！\n規格: ${JSON.stringify(
      currentVariant.value.specs
    )}\n數量: ${quantity.value}`
  );
}
</script>

<template>
  <div class="product-container">
    <div class="page-title"><h2>商品頁面</h2></div>
    <div class="product-wrapper">
      <div class="debug-info">
        <div>規格數量: {{ store.specs.length }}</div>
        <div>變體數量: {{ store.variants.length }}</div>
        <pre style="max-height: 200px; overflow: auto">{{ store.specs }}</pre>
        <pre style="max-height: 200px; overflow: auto">{{
          store.variants
        }}</pre>
      </div>

      <div class="product-content">
        <div class="product-image-section">
          <div class="main-image-container">
            <img
              v-if="mainImage"
              :src="mainImage"
              alt="產品圖片"
              class="main-image"
            />
            <div v-else class="no-image">無圖片</div>
          </div>
          <div class="thumbnail-container">
            <img
              v-for="(option, index) in store.specs[0]?.options"
              :key="index"
              :src="option.image"
              @click="
                mainImage = option.image;
                selectSpec1(option.name, option.image);
              "
              class="thumbnail-image"
              :class="{ 'selected-thumbnail': selectedSpec1 === option.name }"
            />
          </div>
        </div>

        <div class="product-info-section">
          <h2 class="product-name">
            {{ store.product?.name || "未命名商品" }}
          </h2>
          <h1 class="product-price">{{ displayPrice }}</h1>

          <div v-if="store.specs.length > 0" class="spec-section">
            <div class="spec-title">{{ colorTitle || "顏色" }}</div>
            <div class="spec-options">
              <button
                v-for="(option, index) in store.specs[0]?.options"
                :key="index"
                @click="selectSpec1(option.name, option.image)"
                :disabled="getColorStock(option.name) === 0"
                class="spec-button"
                :class="{
                  'spec-selected': selectedSpec1 === option.name,
                  'spec-disabled': getColorStock(option.name) === 0,
                }"
              >
                <img
                  v-if="option.image"
                  :src="option.image"
                  class="spec-option-image"
                />
                {{ option.name }}
              </button>
            </div>
          </div>

          <div v-if="store.specs.length > 1" class="spec-section">
            <div class="spec-title">{{ sizeTitle || "尺寸" }}</div>
            <div class="spec-options">
              <button
                v-for="(option, index) in store.specs[1]?.options"
                :key="index"
                @click="selectSpec2(option.name)"
                :disabled="!selectedSpec1 || getSizeStock(option.name) === 0"
                class="spec-button"
                :class="{
                  'spec-selected': selectedSpec2 === option.name,
                  'spec-disabled':
                    !selectedSpec1 || getSizeStock(option.name) === 0,
                }"
              >
                {{ option.name }}
              </button>
            </div>
          </div>

          <div class="quantity-section">
            <span>數量</span>
            <div class="quantity-control">
              <button
                @click="decreaseQuantity"
                :disabled="!currentVariant || quantity <= 1"
                class="quantity-button"
              >
                －
              </button>
              <span class="quantity-value">{{ quantity }}</span>
              <button
                @click="increaseQuantity"
                :disabled="!currentVariant || quantity >= stockLeft"
                class="quantity-button"
              >
                ＋
              </button>
            </div>
            <span class="stock-info">剩餘：{{ stockLeft }} 件</span>
          </div>

          <button
            @click="addToCart"
            :disabled="!currentVariant || stockLeft <= 0"
            class="add-to-cart-button"
            :class="{ 'button-disabled': !currentVariant || stockLeft <= 0 }"
          >
            加入購物車
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  max-width: 100%;
}
.product-container {
  display: block;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
}

.product-wrapper {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 30px;
  box-sizing: border-box;
}

.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: #f9f9f9;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 1000;
  display: none;
}

.product-content {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  max-width: 100%;
  box-sizing: border-box;
}

.product-image-section {
  flex: 1;
  min-width: 300px;
}

.main-image-container {
  width: 100%;
  height: 400px;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 15px;
}
.page-title {
  text-align: center;
}
.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-image {
  color: #ccc;
  font-size: 16px;
}

.thumbnail-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.thumbnail-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.thumbnail-image:hover {
  border-color: #ff5722;
  transform: scale(1.05);
}

.selected-thumbnail {
  border: 2px solid #ff5722;
}

.product-info-section {
  flex: 1;
  min-width: 300px;
}

.product-name {
  font-size: 24px;
  margin: 0 0 10px 0;
  color: #333;
}

.product-price {
  font-size: 28px;
  color: #ff5722;
  margin: 0 0 20px 0;
  font-weight: bold;
}

.spec-section {
  margin-bottom: 20px;
}

.spec-title {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 500;
  color: #333;
}

.spec-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.spec-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.spec-button:hover:not(.spec-disabled) {
  border-color: #ff5722;
}

.spec-selected {
  border: 2px solid #ff5722;
  font-weight: 500;
}

.spec-disabled {
  background-color: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.spec-option-image {
  width: 20px;
  height: 20px;
  object-fit: cover;
  margin-right: 6px;
  border-radius: 2px;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-button {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.quantity-button:hover:not(:disabled) {
  background-color: #f7f7f7;
}

.quantity-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.quantity-value {
  width: 40px;
  text-align: center;
  font-size: 16px;
}

.stock-info {
  color: #999;
  font-size: 14px;
}

.add-to-cart-button {
  padding: 12px 30px;
  background-color: #ff5722;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
}

.add-to-cart-button:hover:not(.button-disabled) {
  background-color: #e64a19;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.button-disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .product-container {
    padding: 15px;
  }

  .product-wrapper {
    padding: 20px;
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }

  .product-content {
    gap: 30px;
  }

  .main-image-container {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .product-container {
    padding: 0;
  }

  .product-wrapper {
    padding: 15px;
    box-shadow: none;
  }

  .product-content {
    flex-direction: column;
    gap: 20px;
  }

  .product-image-section,
  .product-info-section {
    width: 100%;
    flex: none;
  }

  .main-image-container {
    height: 300px;
  }

  .product-name {
    font-size: 22px;
  }

  .product-price {
    font-size: 24px;
  }

  .spec-button {
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .product-container {
    min-height: auto;
    padding: 0;
  }

  .product-wrapper {
    padding: 10px;
    border-radius: 0;
  }

  .product-content {
    gap: 15px;
  }

  .main-image-container {
    height: 220px;
  }

  .thumbnail-container {
    justify-content: center;
  }

  .thumbnail-image {
    width: 45px;
    height: 45px;
  }

  .product-name {
    font-size: 18px;
  }

  .product-price {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .spec-section {
    margin-bottom: 15px;
  }

  .spec-title {
    font-size: 15px;
    margin-bottom: 8px;
  }

  .spec-options {
    gap: 6px;
  }

  .spec-button {
    padding: 5px 10px;
    font-size: 14px;
  }

  .quantity-section {
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .quantity-button {
    width: 32px;
    height: 32px;
  }

  .stock-info {
    width: 100%;
    margin-top: 5px;
    text-align: left;
  }

  .add-to-cart-button {
    width: 100%;
    max-width: 100%;
    font-size: 15px;
    padding: 10px;
  }
}
</style>
