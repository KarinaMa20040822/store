import { defineStore } from 'pinia'

export type SpecOption = {
  name: string
  image?: string
}

export type Spec = {
  title: string
  options: SpecOption[]
}

export type ProductVariant = {
  id: string
  spec1: string
  spec2?: string
  quantity: number
}

export const useProductStore = defineStore('product', {
  state: () => ({
    specs: [] as Spec[],
    variants: [] as ProductVariant[],
  }),

  actions: {
    addSpec(spec: Spec) {
      this.specs.push(spec)
    },

    setSpecs(specs: Spec[]) {
      this.specs = specs
    },

    setVariants(variants: ProductVariant[]) {
      this.variants = variants
    },

    updateVariantQuantity(id: string, newQty: number) {
      const variant = this.variants.find(v => v.id === id)
      if (variant) variant.quantity = newQty
    },
  },
})
