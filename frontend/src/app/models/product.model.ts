export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  sku: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
