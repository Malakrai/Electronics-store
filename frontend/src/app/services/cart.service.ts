// frontend/src/app/client/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private STORAGE_KEY = 'cart';
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadFromStorage());
  items$ = this.itemsSubject.asObservable();

  constructor() {}

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) as CartItem[] : [];
    } catch (e) {
      console.warn('Erreur lecture localStorage', e);
      return [];
    }
  }

  private saveToStorage(items: CartItem[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      this.itemsSubject.next(items);
    } catch (e) {
      console.warn('Erreur écriture localStorage', e);
    }
  }

  getItems(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  addItem(item: CartItem) {
    const items = this.getItems();
    const existing = items.find(i => i.productId === item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push({ ...item });
    }
    this.saveToStorage(items);
  }

  updateQuantity(productId: number, quantity: number) {
    const items = this.getItems().map(i => i.productId === productId ? { ...i, quantity } : i)
      .filter(i => i.quantity > 0);
    this.saveToStorage(items);
  }

  removeItem(productId: number) {
    const items = this.getItems().filter(i => i.productId !== productId);
    this.saveToStorage(items);
  }

  clear() {
    this.saveToStorage([]);
  }

  subtotal(): number {
    return this.getItems().reduce((s, i) => s + (i.price * i.quantity), 0);
  }

  count(): number {
    return this.getItems().reduce((c, i) => c + i.quantity, 0);
  }
}
