import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CheckoutResponse {
  orderId: number;
  orderNumber?: string;
  totalAmount: number;
  orderDate: string;
  billId?: number;
  status?: string;
}

interface CheckoutItemDto {
  productId: number;
  quantity: number;
}

interface CheckoutRequest {
  items: CheckoutItemDto[];
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  totalAmount: number;
  shippingAmount?: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'electronics_cart_v1';
  private readonly API_URL = 'http://localhost:8080/api';

  private readonly _items$ = new BehaviorSubject<CartItem[]>(this.loadFromStorage());

  readonly items$: Observable<CartItem[]> = this._items$.asObservable();

  readonly total$: Observable<number> = this.items$.pipe(
    map(items => items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  );

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

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

  add(productId: number, productName: string, price: number, imageUrl?: string): void {
    this.addItem({
      productId,
      productName,
      price,
      quantity: 1,
      imageUrl
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

  // ---------- Checkout ----------
  checkout(): Observable<CheckoutResponse> {
    const items = this._items$.value;
    if (!items.length) {
      return throwError(() => new Error('Cart is empty'));
    }

    const currentUser = this.authService.getCurrentUser() as any;
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const customerId = currentUser?.userId || currentUser?.id;
    const customerName = currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.email || currentUser?.username || 'Client';
    const customerEmail = currentUser?.email || '';

    const totalAmount = this.getCurrentTotal();

    const body: CheckoutRequest = {
      customerId: customerId,
      customerName: customerName,
      customerEmail: customerEmail,
      totalAmount: totalAmount,
      shippingAmount: 0,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity
      }))
    };

    console.log('📤 Checkout request:', JSON.stringify(body, null, 2));

    const headers = this.getHeaders();

    return this.http.post<CheckoutResponse>(`${this.API_URL}/orders/checkout`, body, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Checkout error:', {
            status: error.status,
            error: error.error,
            message: error.message
          });
          return throwError(() => error);
        })
      );
  }

  // ---------- Méthodes utilitaires ----------
  getCurrentItems(): CartItem[] {
    return [...this._items$.value];
  }

  getCurrentTotal(): number {
    return this._items$.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getItemCount(): number {
    return this._items$.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  getItemQuantity(productId: number): number {
    const item = this._items$.value.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  }

  hasItems(): boolean {
    return this._items$.value.length > 0;
  }

  isEmpty(): boolean {
    return this._items$.value.length === 0;
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

  // ---------- Headers ----------
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }
}
