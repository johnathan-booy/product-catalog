<template>
  <div class="product-card">
    <h3>{{ product.name }}</h3>
    <p class="brand">{{ product.brand }}</p>
    <p class="description">{{ product.description }}</p>
    <div class="product-details">
      <span class="price">${{ product.price }}</span>
      <span class="category">{{ product.category }}</span>
    </div>
    <div class="product-meta">
      <span class="rating">⭐ {{ product.customerRating }}/5</span>
      <span class="stock">Stock: {{ product.quantity }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "@/types/Product"

defineProps<{
  product: Product
}>()
</script>

<style scoped>
.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.product-card h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2em;
}

.brand {
  color: #666;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.description {
  color: #555;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.price {
  font-size: 1.3em;
  font-weight: bold;
  color: #2e7d32;
}

.category {
  background: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #1565c0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #666;
}
</style>
