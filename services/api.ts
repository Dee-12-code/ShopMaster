import { Product } from "@/types";

const BASE_URL = "https://fakestoreapi.com";

export const API = {
  // Products
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${BASE_URL}/products`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return await response.json();
  },

  async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error("Failed to fetch product");
    return await response.json();
  },

  async getCategories(): Promise<string[]> {
    const response = await fetch(`${BASE_URL}/products/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return await response.json();
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await fetch(`${BASE_URL}/products/category/${category}`);
    if (!response.ok) throw new Error("Failed to fetch category products");
    return await response.json();
  },
};
