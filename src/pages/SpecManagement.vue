<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useProductStore, Spec } from '@/store/productStore'

const store = useProductStore()

// 限制兩組規格
const specInputs = ref<Spec[]>([
  { title: '', options: [] },
])

// 對應每組規格的輸入欄與圖片預覽
const newOptionInputs = ref<string[]>([''])
const newOptionImages = ref<string[]>([''])

// 控制每組規格是否正在編輯名稱
const editingSpecTitle = ref<boolean[]>([true])

watch(specInputs, (newVal) => {
  // 同步新增對應欄位
  editingSpecTitle.value = newVal.map(() => false)
  newOptionInputs.value = newVal.map(() => '')
  newOptionImages.value = newVal.map(() => '')
})

// 新增一組規格（最多 2 組）
function addSpec() {
  if (specInputs.value.length < 2) {
    specInputs.value.push({ title: '', options: [] })
    newOptionInputs.value.push('')
    newOptionImages.value.push('')
  }
}

// 處理圖片上傳
function handleImageUpload(specIndex: number, event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newOptionImages.value[specIndex] = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}



// 刪除某個選項
function deleteOption(specIndex: number, optionIndex: number) {
  specInputs.value[specIndex].options.splice(optionIndex, 1)
}
function addOption(specIndex: number) {
  const name = newOptionInputs.value[specIndex].trim()
  const image = newOptionImages.value[specIndex]

  if (name) {
    // 將選項加入指定規格中
    specInputs.value[specIndex].options.push({ name, image })

    // 清空輸入欄與圖片預覽
    newOptionInputs.value[specIndex] = ''
    newOptionImages.value[specIndex] = ''
  }
}

// 計算產品變體組合
const productVariants = computed(() => {
  if (
    specInputs.value.length === 0 ||
    specInputs.value.some(spec => spec.title.trim() === '' || spec.options.length === 0)
  ) {
    return []
  }

  if (specInputs.value.length === 1) {
    return specInputs.value[0].options.map(option => ({
      specs: { [specInputs.value[0].title]: option.name },
      image: option.image,
      price: 123,
      stock: 1
    }))
  }

  const variants = []
  for (const option1 of specInputs.value[0].options) {
    for (const option2 of specInputs.value[1].options) {
      variants.push({
        specs: {
          [specInputs.value[0].title]: option1.name,
          [specInputs.value[1].title]: option2.name
        },
        image: option1.image,
        price: 123,
        stock: 1
      })
    }
  }
  return variants
})
</script>


<template>
  <div>
    <h2>規格管理頁</h2>

    <!-- 👇包住所有規格 -->
    <div
      v-for="(spec, specIndex) in specInputs"
      :key="specIndex"
      style="border: 1px solid #eee; padding: 1rem; margin-bottom: 1rem; background-color: #f9f9f9; border-radius: 4px;"
    >
      <!-- 規格標題與筆編輯 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <div>
          <span style="color: #ff5722; font-weight: bold;" v-if="specIndex === 0">●</span>

          <input
            v-if="editingSpecTitle[specIndex]"
            v-model="spec.title"
            @blur="editingSpecTitle[specIndex] = false"
            @keyup.enter="editingSpecTitle[specIndex] = false"
            placeholder="輸入規格名稱"
            style="padding: 0.3rem; border: 1px solid #ccc; border-radius: 4px; width: 200px;"
          />
          <span v-else>{{ spec.title || '未命名規格' }}</span>

          <button @click="editingSpecTitle[specIndex] = true" style="margin-left: 0.5rem; color: #666; border: none; background: none;">
            ✏️
          </button>
        </div>
      </div>

      <!-- 新增選項區塊 -->
      <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem;">
        <!-- 預覽縮圖 -->
        <div v-if="newOptionImages[specIndex]" style="width: 30px; height: 30px;">
          <img :src="newOptionImages[specIndex]" style="width: 100%; height: 100%; object-fit: cover; border-radius: 2px;" />
        </div>

        <!-- 上傳圖片按鈕 -->
        <div style="position: relative; display: inline-block;">
          <input
            type="file"
            :id="'image-upload-' + specIndex"
            @change="handleImageUpload(specIndex, $event)"
            style="opacity: 0; position: absolute; inset: 0; cursor: pointer;"
          />
          <button type="button">上傳圖片</button>
        </div>

        <!-- 選項名稱 -->
        <input
          v-model="newOptionInputs[specIndex]"
          placeholder="請輸入選項名稱"
          style="padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px;"
        />
        <button @click="addOption(specIndex)">新增選項</button>
      </div>

      <!-- 已添加的選項列表（單一區塊樣式） -->
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
        <div
          v-for="(option, optionIndex) in spec.options"
          :key="optionIndex"
          style="border: 1px solid #ddd; padding: 0.5rem; border-radius: 4px; display: flex; align-items: center; background-color: white;"
        >
          <div v-if="option.image" style="width: 24px; height: 24px; margin-right: 0.5rem;">
            <img :src="option.image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 2px;" />
          </div>
          <span>{{ option.name }}</span>
          <button @click="deleteOption(specIndex, optionIndex)" style="margin-left: 0.5rem; border: none; background: none; color: #999;">
            ❌
          </button>
        </div>
      </div>
    </div>

    <!-- 新增規格按鈕 -->
    <div v-if="specInputs.length < 2" style="margin-bottom: 2rem;">
      <button @click="addSpec" style="padding: 0.5rem 1rem; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 4px;">
        新增一組規格
      </button>
    </div>
    
    <!-- 產品變體表格 -->
    <div style="margin-top: 2rem; border: 1px solid #eee; border-radius: 4px; overflow: hidden;">
      
      <table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background-color: #f5f5f5;">
      <!-- 圖片欄 -->
      <th style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #eee;">圖片</th>

      <!-- 規格欄 1 -->
      <th v-if="specInputs.length > 0" style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #eee;">
        <span style="color: #ff5722;">●</span> {{ specInputs[0].title || '規格 1' }}
      </th>

      <!-- 規格欄 2 -->
      <th v-if="specInputs.length > 1" style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #eee;">
        <span style="color: #ff5722;">●</span> {{ specInputs[1].title || '規格 2' }}
      </th>

      <!-- 價格與數量欄 -->
      <th style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #eee;">
        <span style="color: #ff5722;">*</span> 價錢
      </th>
      <th style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #eee;">商品數量</th>
    </tr>
  </thead>

  <tbody>
    <tr
      v-for="(variant, index) in productVariants"
      :key="index"
      style="border-bottom: 1px solid #eee;"
    >
      <!-- 縮圖欄 -->
      <td style="padding: 0.5rem; text-align: center;">
        <div v-if="variant.image" style="width: 40px; height: 40px; margin: auto;">
          <img :src="variant.image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />
        </div>
        <div v-else style="color: #aaa;">無</div>
      </td>

      <!-- 規格 1 名稱（顏色等） -->
      <td style="padding: 0.5rem; text-align: center;">
        {{ variant.specs[specInputs[0].title] }}
      </td>

      <!-- 規格 2 名稱（尺寸等） -->
      <td style="padding: 0.5rem; text-align: center;" v-if="specInputs.length > 1">
        {{ variant.specs[specInputs[1].title] }}
      </td>

      <!-- 價格欄 -->
      <td style="padding: 0.5rem;">
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 0.25rem;">NT$</span>
          <input
            type="text"
            v-model="variant.price"
            style="width: 100%; padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px;"
          />
        </div>
      </td>

      <!-- 數量欄 -->
      <td style="padding: 0.5rem;">
        <input
          type="number"
          v-model="variant.stock"
          min="0"
          style="width: 100%; padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px;"
        />
      </td>
    </tr>
  </tbody>
</table>

      
    </div>
  </div>
</template>