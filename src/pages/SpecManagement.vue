<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useProductStore, Spec } from "@/store/productStore";

const store = useProductStore();

const specInputs = ref<Spec[]>([{ title: "", options: [] }]);

const newOptionInputs = ref<string[]>([""]);
const newOptionImages = ref<string[]>([""]);

const editingSpecTitle = ref<boolean[]>([true]);

watch(specInputs, (newVal) => {
  editingSpecTitle.value = newVal.map(() => false);
  newOptionInputs.value = newVal.map(() => "");
  newOptionImages.value = newVal.map(() => "");
});

function addSpec() {
  if (specInputs.value.length < 2) {
    specInputs.value.push({ title: "", options: [] });
    newOptionInputs.value.push("");
    newOptionImages.value.push("");
  }
}

function handleImageUpload(specIndex: number, event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const imageUrl = URL.createObjectURL(file);
    newOptionImages.value[specIndex] = imageUrl;
  }
}

function addOption(specIndex: number) {
  const name = newOptionInputs.value[specIndex].trim();
  const image = newOptionImages.value[specIndex];

  if (!name) return;

  if (specIndex === 0 && !image) {
    alert("請先上傳圖片後再新增選項");
    return;
  }

  specInputs.value[specIndex].options.push({
    name,
    image: specIndex === 0 ? image : "",
  });

  newOptionInputs.value[specIndex] = "";
  newOptionImages.value[specIndex] = "";
}

function deleteOption(specIndex: number, optionIndex: number) {
  specInputs.value[specIndex].options.splice(optionIndex, 1);
}

const productVariants = computed(() => {
  if (
    specInputs.value.length === 0 ||
    specInputs.value.some(
      (spec) => spec.title.trim() === "" || spec.options.length === 0
    )
  ) {
    return [];
  }

  if (specInputs.value.length === 1) {
    return specInputs.value[0].options.map((option) => ({
      specs: { [specInputs.value[0].title]: option.name },
      image: option.image,
      price: option.price || 0,
      stock: option.stock || 0,
    }));
  }

  const variants = [];
  for (const option1 of specInputs.value[0].options) {
    for (const option2 of specInputs.value[1].options) {
      variants.push({
        specs: {
          [specInputs.value[0].title]: option1.name,
          [specInputs.value[1].title]: option2.name,
        },
        image: option1.image,
        price: 0,
        stock: 0,
      });
    }
  }
  return variants;
});

const groupedVariants = computed(() => {
  const result: Record<string, typeof productVariants.value> = {};

  if (!productVariants.value.length) return result;

  const firstSpecTitle = specInputs.value[0].title;

  productVariants.value.forEach((variant) => {
    const key = variant.specs[firstSpecTitle];
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(variant);
  });

  return result;
});

const productName = ref("");

function saveSpecsToStore() {
  store.setProduct({ name: productName.value });
  store.setSpecs(specInputs.value);
  store.setVariants(productVariants.value);
  alert("已成功儲存！");
}
</script>

<template>
  <div>
    <h2>規格管理頁</h2>
    <div style="margin-bottom: 1rem">
      <label for="productName">產品名稱：</label>
      <input
        id="productName"
        v-model="productName"
        placeholder="請輸入產品名稱"
        style="
          padding: 0.5rem;
          width: 100%;
          max-width: 400px;
          border: 1px solid #ccc;
          border-radius: 4px;
        "
      />
    </div>

    <div
      v-for="(spec, specIndex) in specInputs"
      :key="specIndex"
      style="
        border: 1px solid #eee;
        padding: 1rem;
        margin-bottom: 1rem;
        background-color: #f9f9f9;
        border-radius: 4px;
      "
    >
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        "
      >
        <div>
          <span style="color: #ff5722; font-weight: bold">●</span>

          <input
            v-if="editingSpecTitle[specIndex]"
            v-model="spec.title"
            @blur="editingSpecTitle[specIndex] = false"
            @keyup.enter="editingSpecTitle[specIndex] = false"
            placeholder="輸入規格名稱"
            style="
              padding: 0.3rem;
              border: 1px solid #ccc;
              border-radius: 4px;
              width: 200px;
            "
          />
          <span v-else>{{ spec.title || "未命名規格" }}</span>

          <button
            @click="editingSpecTitle[specIndex] = true"
            style="
              margin-left: 0.5rem;
              color: #666;
              border: none;
              background: none;
            "
          >
            ✏️
          </button>
        </div>
      </div>

      <div
        style="
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-bottom: 1rem;
        "
      >
        <div
          v-if="newOptionImages[specIndex]"
          style="width: 30px; height: 30px"
        >
          <img
            :src="newOptionImages[specIndex]"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 2px;
            "
          />
        </div>

        <div
          v-if="specIndex === 0"
          style="position: relative; display: inline-block"
        >
          <input
            type="file"
            :id="'image-upload-' + specIndex"
            @change="handleImageUpload(specIndex, $event)"
            style="opacity: 0; position: absolute; inset: 0; cursor: pointer"
          />
          <button type="button">上傳圖片</button>
        </div>

        <input
          v-model="newOptionInputs[specIndex]"
          placeholder="請輸入選項名稱"
          style="padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px"
        />
        <button @click="addOption(specIndex)">新增選項</button>
      </div>

      <div
        style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem"
      >
        <div
          v-for="(option, optionIndex) in spec.options"
          :key="optionIndex"
          style="
            border: 1px solid #ddd;
            padding: 0.5rem;
            border-radius: 4px;
            display: flex;
            align-items: center;
            background-color: white;
          "
        >
          <div
            v-if="option.image"
            style="width: 24px; height: 24px; margin-right: 0.5rem"
          >
            <img
              :src="option.image"
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 2px;
              "
            />
          </div>
          <span>{{ option.name }}</span>
          <button
            @click="deleteOption(specIndex, optionIndex)"
            style="
              margin-left: 0.5rem;
              border: none;
              background: none;
              color: #999;
            "
          >
            ❌
          </button>
        </div>
      </div>
    </div>

    <div v-if="specInputs.length < 2" style="margin-bottom: 2rem">
      <button
        @click="addSpec"
        style="
          padding: 0.5rem 1rem;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
        "
      >
        新增一組規格
      </button>
    </div>
    <div
      style="
        margin-top: 2rem;
        border: 1px solid #eee;
        border-radius: 4px;
        overflow: hidden;
      "
    >
      <table style="width: 100%; border-collapse: collapse">
        <thead>
          <tr style="background-color: white">
            <th
              style="
                padding: 0.5rem;
                text-align: center;
                border-bottom: 1px solid #eee;
              "
            >
              <span style="font-size: large"></span>產品圖片
            </th>
            <th
              v-if="specInputs.length > 0"
              style="
                padding: 0.5rem;
                text-align: center;
                border-bottom: 1px solid #eee;
              "
            >
              <span style="color: #ff5722; font-size: large">●</span
              >{{ specInputs[0].title || "規格 1" }}
            </th>

            <th
              v-if="specInputs.length > 1"
              style="
                padding: 0.5rem;
                text-align: center;
                border-bottom: 1px solid #eee;
              "
            >
              <span style="color: #ff5722; font-size: large">●</span>
              {{ specInputs[1].title || "規格 2" }}
            </th>

            <th
              style="
                padding: 0.5rem;
                text-align: center;
                border-bottom: 1px solid #eee;
                width: 25%;
              "
            >
              <span style="color: #ff5722; font-size: large">*</span> 價錢
            </th>
            <th
              style="
                padding: 0.5rem;
                text-align: center;
                border-bottom: 1px solid #eee;
                width: 25%;
                font-size: large;
              "
            >
              商品數量
            </th>
          </tr>
        </thead>

        <tbody>
          <template
            v-for="(colorGroup, colorName, colorIndex) in groupedVariants"
            :key="colorName"
          >
            <tr
              v-for="(variant, variantIndex) in colorGroup"
              :key="`${colorName}-${variantIndex}`"
              style="border-bottom: 1px solid #eee"
            >
              <td
                v-if="variantIndex === 0"
                :rowspan="colorGroup.length"
                style="
                  padding: 0.5rem;
                  text-align: center;
                  vertical-align: middle;
                "
              >
                <div
                  v-if="variant.image"
                  style="width: 50px; height: 50px; margin: auto"
                >
                  <img
                    :src="variant.image"
                    style="
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      border-radius: 4px;
                    "
                  />
                </div>
                <div v-else style="color: #aaa">無</div>
              </td>

              <!-- 規格1 (顏色) -->
              <td
                v-if="variantIndex === 0"
                :rowspan="colorGroup.length"
                style="
                  padding: 0.5rem;
                  text-align: center;
                  vertical-align: middle;
                "
              >
                {{ colorName }}
              </td>

              <td
                v-if="specInputs.length > 1"
                style="
                  padding: 0.5rem;
                  text-align: center;
                  vertical-align: middle;
                "
              >
                {{ variant.specs[specInputs[1].title] }}
              </td>

              <td style="padding: 0.5rem; vertical-align: middle">
                <div style="display: flex; align-items: center">
                  <span style="margin-right: 0.25rem">NT$</span>
                  <input
                    type="text"
                    v-model="variant.price"
                    style="
                      width: 100%;
                      padding: 0.3rem;
                      border: 1px solid #ddd;
                      border-radius: 4px;
                    "
                  />
                </div>
              </td>

              <td style="padding: 0.5rem; vertical-align: middle">
                <input
                  type="number"
                  v-model="variant.stock"
                  min="0"
                  style="
                    width: 100%;
                    padding: 0.3rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                  "
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div style="text-align: center; margin-top: 2rem">
      <button
        @click="saveSpecsToStore"
        style="
          padding: 0.5rem 1rem;
          background-color: #e48a52;
          color: white;
          border: none;
          border-radius: 4px;
        "
      >
        儲存
      </button>
    </div>
  </div>
</template>
<style>
body {
  background-color: #ffffff;
}
</style>
