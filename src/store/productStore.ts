import { defineStore } from "pinia";

export interface SpecOption {
  name: string;
  image?: string;
  price?: number;
  stock?: number;
}

export interface Spec {
  title: string;
  options: SpecOption[];
}

export interface Variant {
  specs: Record<string, string>;
  image: string;
  price: number;
  stock: number;
}

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
    setProduct(product: Product) {
      this.product = product;
      console.log("設置產品到商店:", product);
    },

    setSpecs(specs: Spec[]) {
      this.specs = specs.map((spec) => ({
        ...spec,
        options: spec.options.map((option) => ({
          ...option,
          image: option.image,
        })),
      }));
      console.log("設置規格到商店:", this.specs);
    },

    setVariants(variants: Variant[]) {
      this.variants = variants.map((v) => ({
        ...v,
        image: v.image?.startsWith("data:image/") ? "" : v.image,
        price: typeof v.price === "string" ? parseFloat(v.price) || 0 : v.price,
      }));
      console.log("設置變體到商店:", this.variants);
    },

    clearStore() {
      this.product = null;
      this.specs = [];
      this.variants = [];
      console.log("✅ 商店已清空");
      localStorage.removeItem("product-store");
    },
  },

  persist: {
    storage: localStorage,
    key: "product-store",
    paths: ["product", "specs", "variants"],
  },
});
