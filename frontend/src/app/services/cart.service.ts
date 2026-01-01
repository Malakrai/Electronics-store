import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CheckoutItemDto {
  productId: number;
  quantity: number;
}

interface CheckoutRequestDto {
  items: CheckoutItemDto[];
  customerName?: string | null;
  customerEmail?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'electronics_cart_v1';
  private readonly API_URL = 'http://localhost:8080/api';

  private readonly _items$ = new BehaviorSubject<CartItem[]>(this.loadFromStorage());

  /** Liste panier */
  readonly items$: Observable<CartItem[]> = this._items$.asObservable();

  /** Total en € */
  readonly total$: Observable<number> = this.items$.pipe(
    map(items => items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  );

  constructor(private http: HttpClient) {}

  // ---------- CRUD panier ----------
  addItem(item: CartItem) {
    const items = this._items$.value;
    const idx = items.findIndex(i => i.productId === item.productId);

    let next: CartItem[];
    if (idx >= 0) {
      next = items.map(i =>
        i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      next = [...items, { ...item }];
    }

    this.setItems(next);
  }

  /** Compat avec ton code si tu appelles cartService.add(...) */
  add(payload: { productId: number; name: string; price: number; quantity?: number; imageUrl?: string }) {
    this.addItem({
      productId: payload.productId,
      productName: payload.name,
      price: payload.price,
      quantity: payload.quantity ?? 1,
      imageUrl: payload.imageUrl
    });
  }

  increase(productId: number) {
    const next = this._items$.value.map(i =>
      i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
    );
    this.setItems(next);
  }

  decrease(productId: number) {
    const next = this._items$.value
      .map(i => (i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i))
      .filter(i => i.quantity > 0);
    this.setItems(next);
  }

  remove(productId: number) {
    const next = this._items$.value.filter(i => i.productId !== productId);
    this.setItems(next);
  }

  clear() {
    this.setItems([]);
  }

  // ---------- Checkout (enregistre en DB via ton backend) ----------
  checkout(extra?: { customerName?: string; customerEmail?: string }): Observable<any> {
    const items = this._items$.value;
    if (!items.length) throw new Error('Cart is empty');

    const body: CheckoutRequestDto = {
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      customerName: extra?.customerName ?? null,
      customerEmail: extra?.customerEmail ?? null
    };

    return this.http.post(`${this.API_URL}/orders/checkout`, body);
  }

  // ---------- Storage ----------
  private setItems(items: CartItem[]) {
    this._items$.next(items);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}