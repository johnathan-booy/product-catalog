<template>
  <div id="app">
    <h1>Product Catalog</h1>

    <SearchBar
      v-model="searchQuery"
      @search="onSearch"
    />

    <div
      v-if="loading"
      class="loading"
    >
      Loading products...
    </div>

    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <div
      v-else
      class="products-grid"
    >
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { api } from "@/services/api"
import type { Product } from "@/types/Product"
import ProductCard from "@/components/ProductCard.vue"
import SearchBar from "@/components/SearchBar.vue"

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref("")

const updateURL = (query: string) => {
  const url = new URL(window.location.href)
  if (query) {
    url.searchParams.set('q', query)
  } else {
    url.searchParams.delete('q')
  }
  window.history.replaceState({}, '', url.toString())
}

const fetchProducts = async (query?: string) => {
  try {
    loading.value = true
    error.value = null
    
    if (query && query.trim()) {
      products.value = await api.searchProducts(query.trim())
    } else {
      products.value = await api.getAllProducts()
    }
  } catch (err) {
    if (err instanceof Error) {
      // Provide more user-friendly error messages
      if (err.message.includes('Internal Server Error')) {
        error.value = query && query.trim() 
          ? "Search is temporarily unavailable. Please try a different search term or refresh the page."
          : "Unable to load products. Please refresh the page."
      } else if (err.message.includes('Failed to search')) {
        error.value = "Search failed. Please try a different search term."
      } else {
        error.value = err.message
      }
    } else {
      error.value = "An unexpected error occurred. Please try again."
    }
  } finally {
    loading.value = false
  }
}

const onSearch = async (query: string) => {
  updateURL(query)
  await fetchProducts(query)
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const queryParam = urlParams.get('q')
  
  if (queryParam) {
    searchQuery.value = queryParam
    fetchProducts(queryParam)
  } else {
    fetchProducts()
  }
})
</script>

<style scoped>
#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}

.error {
  color: #d32f2f;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
</style>
