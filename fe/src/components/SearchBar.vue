<template>
  <div class="search-container">
    <input
      v-model="localQuery"
      type="text"
      placeholder="Search products..."
      class="search-input"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', query: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localQuery = ref(props.modelValue)
const debounceTimeout = ref<number | null>(null)

watch(() => props.modelValue, (newValue) => {
  localQuery.value = newValue
})

const isValidSearchQuery = (query: string): boolean => {
  if (!query.trim()) return true
  
  // Prevent FTS special characters that could cause errors
  const problematicPatterns = [
    /^[.*+?^${}()|[\]\\]+$/,  // Only special regex/FTS characters
    /^\s*[.]\s*$/,            // Just a dot
    /^\s*[*]\s*$/,            // Just an asterisk
  ]
  
  return !problematicPatterns.some(pattern => pattern.test(query))
}

const onInput = () => {
  emit('update:modelValue', localQuery.value)
  
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }
  
  debounceTimeout.value = setTimeout(() => {
    // Only emit search if query is valid or empty
    if (isValidSearchQuery(localQuery.value)) {
      emit('search', localQuery.value)
    }
  }, 300) as unknown as number
}
</script>

<style scoped>
.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.search-input::placeholder {
  color: #999;
}
</style>