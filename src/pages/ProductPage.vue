<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useProductStore } from "@/store/productStore";

// 取得 Pinia store
const store = useProductStore();

// 預設選取的規格
const selectedSpec1 = ref("");
const selectedSpec2 = ref("");
const quantity = ref(1);

// 主圖片（初始化）
const mainImage = ref("");

// 在組件掛載時確保數據已加載
onMounted(() => {
  console.log("ProductPage 掛載時的 store 資料:", {
    specs: store.specs,
    variants: store.variants,
  });

  // 如果沒有資料，可以嘗試從 localStorage 直接讀取
  if (store.specs.length === 0) {
    const storedData = localStorage.getItem("product-store");
    console.log("從 localStorage 讀取的資料:", storedData);
  }
  // 初始化主圖片 - 確保有規格數據才設置
  if (store.specs.length > 0 && store.specs[0].options.length > 0) {
    mainImage.value = store.specs[0].options[0].image || "";
  }
});

// 取得規格標題（顏色/尺寸）
const colorTitle = computed(() => store.specs[0]?.title || "");
const sizeTitle = computed(() => store.specs[1]?.title || "");

// 根據選取規格找出商品變體
const currentVariant = computed(() => {
  if (!selectedSpec1.value) return null;

  // 如果只有一種規格
  if (!sizeTitle.value || !selectedSpec2.value) {
    return store.variants.find(
      (variant) => variant.specs[colorTitle.value] === selectedSpec1.value
    );
  }

  // 如果有兩種規格
  return store.variants.find((variant) => {
    const matchColor = variant.specs[colorTitle.value] === selectedSpec1.value;
    const matchSize = variant.specs[sizeTitle.value] === selectedSpec2.value;
    return matchColor && matchSize;
  });
});

// 顯示價格
const displayPrice = computed(() => {
  return currentVariant.value
    ? `NT$ ${currentVariant.value.price}`
    : "請選擇規格";
});

// 計算庫存剩餘
const stockLeft = computed(() => {
  return currentVariant.value ? currentVariant.value.stock : 0;
});

// 選擇顏色
function selectSpec1(optionName: string, image?: string) {
  selectedSpec1.value = optionName;
  selectedSpec2.value = ""; // 重選顏色時，重置尺寸
  if (image) mainImage.value = image;
}

// 選擇尺寸
function selectSpec2(optionName: string) {
  selectedSpec2.value = optionName;
}

// 增減數量
function decreaseQuantity() {
  if (quantity.value > 1) quantity.value--;
}

function increaseQuantity() {
  if (quantity.value < stockLeft.value) quantity.value++;
}

// 獲取顏色對應的總庫存
function getColorStock(optionName: string) {
  if (!colorTitle.value || store.variants.length === 0) return 0;

  return store.variants
    .filter((variant) => variant.specs[colorTitle.value] === optionName)
    .reduce((total, variant) => total + (variant.stock || 0), 0);
}

// 獲取尺寸對應的庫存（根據已選擇的顏色）
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
</script>

<template>
  <div style="display: flex; gap: 2rem; margin-top: 2rem">
    <!-- 調試信息 -->
    <div
      style="
        position: fixed;
        top: 10px;
        right: 10px;
        background: #f9f9f9;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        z-index: 1000;
        display: none;
      "
    >
      <div>規格數量: {{ store.specs.length }}</div>
      <div>變體數量: {{ store.variants.length }}</div>
      <pre style="max-height: 200px; overflow: auto">{{ store.specs }}</pre>
      <pre style="max-height: 200px; overflow: auto">{{ store.variants }}</pre>
    </div>

    <!-- 左邊圖片區 -->
    <div>
      <div
        style="
          width: 300px;
          height: 300px;
          border: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <img
          v-if="mainImage"
          :src="mainImage"
          alt="產品圖片"
          style="max-width: 100%; max-height: 100%; object-fit: contain"
        />
        <div v-else style="color: #ccc">無圖片</div>
      </div>
      <div
        style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap"
      >
        <img
          v-for="(option, index) in store.specs[0]?.options"
          :key="index"
          :src="option.image"
          @click="
            mainImage = option.image;
            selectSpec1(option.name, option.image);
          "
          style="
            width: 50px;
            height: 50px;
            object-fit: cover;
            cursor: pointer;
            border: 1px solid #ccc;
            border-radius: 4px;
          "
        />
      </div>
    </div>

    <!-- 右邊資訊區 -->
    <div style="flex: 1">
      <h2>{{ store.product?.name || "前端測試商品" }}</h2>
      <h1 style="color: #ff5722; margin-top: 0.5rem">{{ displayPrice }}</h1>

      <!-- 規格一：顏色 -->
      <div v-if="store.specs.length > 0" style="margin-top: 1.5rem">
        <div style="margin-bottom: 0.5rem">{{ colorTitle || "顏色" }}</div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
          <button
            v-for="(option, index) in store.specs[0]?.options"
            :key="index"
            @click="selectSpec1(option.name, option.image)"
            :disabled="getColorStock(option.name) === 0"
            :style="{
              padding: '0.5rem 1rem',
              border:
                selectedSpec1 === option.name
                  ? '2px solid #ff5722'
                  : '1px solid #ccc',
              backgroundColor:
                getColorStock(option.name) === 0 ? '#f5f5f5' : 'white',
              color: getColorStock(option.name) === 0 ? '#ccc' : 'black',
              cursor:
                getColorStock(option.name) === 0 ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }"
          >
            <img
              v-if="option.image"
              :src="option.image"
              style="
                width: 20px;
                height: 20px;
                object-fit: cover;
                margin-right: 4px;
              "
            />
            {{ option.name }}
          </button>
        </div>
      </div>

      <!-- 規格二：尺寸 -->
      <div v-if="store.specs.length > 1" style="margin-top: 1.5rem">
        <div style="margin-bottom: 0.5rem">{{ sizeTitle || "尺寸" }}</div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
          <button
            v-for="(option, index) in store.specs[1]?.options"
            :key="index"
            @click="selectSpec2(option.name)"
            :disabled="!selectedSpec1.value || getSizeStock(option.name) === 0"
            :style="{
              padding: '0.5rem 1rem',
              border:
                selectedSpec2 === option.name
                  ? '2px solid #ff5722'
                  : '1px solid #ccc',
              backgroundColor:
                !selectedSpec1.value || getSizeStock(option.name) === 0
                  ? '#f5f5f5'
                  : 'white',
              color:
                !selectedSpec1.value || getSizeStock(option.name) === 0
                  ? '#ccc'
                  : 'black',
              cursor:
                !selectedSpec1.value || getSizeStock(option.name) === 0
                  ? 'not-allowed'
                  : 'pointer',
              borderRadius: '4px',
            }"
          >
            {{ option.name }}
          </button>
        </div>
      </div>

      <!-- 數量選擇 -->
      <div
        style="
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        "
      >
        <span>數量</span>
        <button
          @click="decreaseQuantity"
          :disabled="!currentVariant || quantity <= 1"
          style="
            padding: 0.3rem 0.8rem;
            border: 1px solid #ccc;
            background-color: white;
            cursor: pointer;
            border-radius: 4px;
          "
        >
          －
        </button>
        <span style="min-width: 20px; text-align: center">{{ quantity }}</span>
        <button
          @click="increaseQuantity"
          :disabled="!currentVariant || quantity >= stockLeft"
          style="
            padding: 0.3rem 0.8rem;
            border: 1px solid #ccc;
            background-color: white;
            cursor: pointer;
            border-radius: 4px;
          "
        >
          ＋
        </button>
        <span style="margin-left: 1rem; color: #999">
          剩餘：{{ stockLeft }} 件
        </span>
      </div>

      <!-- 加入購物車按鈕 -->
      <button
        :disabled="!currentVariant || stockLeft <= 0"
        style="
          margin-top: 1.5rem;
          padding: 0.8rem 2rem;
          background-color: #ff5722;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          width: 100%;
        "
        :style="{
          backgroundColor:
            !currentVariant || stockLeft <= 0 ? '#ccc' : '#ff5722',
          cursor: !currentVariant || stockLeft <= 0 ? 'not-allowed' : 'pointer',
        }"
      >
        加入購物車
      </button>
    </div>
  </div>
</template>
