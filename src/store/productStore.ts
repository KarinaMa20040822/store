import { defineStore } from "pinia";

// 規格選項介面
export interface SpecOption {
  name: string;
  image?: string; // 為圖片 URL
  price?: number;
  stock?: number;
}

// 規格介面
export interface Spec {
  title: string;
  options: SpecOption[];
}

// 變體介面
export interface Variant {
  specs: Record<string, string>;
  image: string; // 圖片 URL
  price: number;
  stock: number;
}

// 產品介面
export interface Product {
  id?: string;
  name: string;
  description?: string;
}

export const useProductStore = defineStore("product", {
  state: () => ({
    product: null as Product | null,
    specs: [] as Spec[],
    variants: [] as Variant[],
  }),

  actions: {
    // 設置產品基本資料
    setProduct(product: Product) {
      this.product = product;
      console.log("設置產品到商店:", product);
    },

    setSpecs(specs: Spec[]) {
      // 移除 base64，只保留圖片 URL
      this.specs = specs.map((spec) => ({
        ...spec,
        options: spec.options.map((option) => ({
          ...option,
          image: option.image,
        })),
      }));
      console.log("設置規格到商店:", this.specs);
      this.manualSaveToLocalStorage();
    },

    // 設置變體（只保留圖片 URL）

    setVariants(variants: Variant[]) {
      this.variants = variants.map((v) => ({
        ...v,
        image: v.image?.startsWith("data:image/") ? "" : v.image,
        price: typeof v.price === "string" ? parseFloat(v.price) || 0 : v.price,
      }));
      console.log("設置變體到商店:", this.variants);
      this.manualSaveToLocalStorage();
    },

    // 清空商店與 localStorage
    clearStore() {
      this.product = null;
      this.specs = [];
      this.variants = [];
      console.log("✅ 商店已清空");
      localStorage.removeItem("product-store");
    },
  },

  // pinia-plugin-persistedstate 設定
  persist: {
    storage: localStorage,
    key: "product-store",
    paths: ["product", "specs", "variants"],
  },
});
