export interface Product {
  id?: number;
  sku?: string;
  name: string;
  description: string;
  price: number;
  cost?: number;
  manufacturerId?: number;
  weight?: number;
  dimensions?: string;
  isActive?: boolean;
  createdAt?: Date;

  imageUrl?: string;
  category: string;
  stock: number;
  status?: string;
}
