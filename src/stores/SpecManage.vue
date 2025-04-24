<script setup lang="ts">
import { useProductStore } from '@/store/productStore'
import { ref } from 'vue'

const store = useProductStore()

const newSpecTitle = ref('')
const newSpecOptions = ref([{ name: '' }])

function addSpec() {
  store.addSpec({
    title: newSpecTitle.value,
    options: newSpecOptions.value,
  })
  newSpecTitle.value = ''
  newSpecOptions.value = [{ name: '' }]
}
</script>
