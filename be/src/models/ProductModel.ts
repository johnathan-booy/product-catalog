export interface ProductModel {
  id: number
  name: string
  description: string
  category: string
  brand: string
  price: number
  quantity: number
  sku: string
  releaseDate: Date
  availabilityStatus: string
  customerRating: number
  createdAt: Date
  updatedAt: Date
}
