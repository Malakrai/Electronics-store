import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem} from '../../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnDestroy {
  cartItems: CartItem[] = [];
  customerName = '';
  errorMessage: string | null = null;
  backendUrl = 'http://localhost:8080/api/orders/checkout';

  private sub?: Subscription;

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {
    this.cartItems = this.cartService.getItems();
    this.sub = this.cartService.items$.subscribe(items => this.cartItems = items);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  increaseQty(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1);
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productId, item.quantity - 1);
    } else {
      this.cartService.removeItem(item.productId);
    }
  }

  onQuantityChange(item: CartItem, value: string): void {
    const q = parseInt(value, 10);
    if (!isNaN(q) && q > 0) {
      this.cartService.updateQuantity(item.productId, q);
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.productId);
  }

  get subtotal(): number {
    return this.cartService.subtotal();
  }

  get shipping(): number {
    return this.subtotal > 0 ? 5 : 0;
  }

  get total(): number {
    return this.subtotal + this.shipping;
  }

  continueShopping(): void {
    this.router.navigate(['/catalog']);
  }

  checkout(): void {
    if (!this.customerName || this.customerName.trim().length < 2) {
      this.errorMessage = 'Veuillez saisir votre nom.';
      return;
    }
    if (this.cartItems.length === 0) {
      this.errorMessage = 'Panier vide.';
      return;
    }
    this.errorMessage = null;

    const body: Array<{productId:number, productName:string, price:number, quantity:number}> =
      this.cartItems.map(ci => ({
        productId: ci.productId,
        productName: ci.productName,
        price: ci.price,
        quantity: ci.quantity
      }));

    const url = `${this.backendUrl}?customerName=${encodeURIComponent(this.customerName)}`;

    this.http.post(url, body).subscribe({
      next: (_res) => {
        this.cartService.clear();
        alert('Commande envoyée — merci !');
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        console.error('Erreur checkout', err);
        this.errorMessage = 'Erreur lors de la validation de la commande.';
      }
    });
  }
}