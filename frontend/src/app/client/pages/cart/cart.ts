import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { CartItem, CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  items$: Observable<CartItem[]> = this.cartService.items$;
  total$: Observable<number> = this.cartService.total$;

  loading = false;
  errorMsg = '';

  inc(productId: number) { this.cartService.increase(productId); }
  dec(productId: number) { this.cartService.decrease(productId); }
  remove(productId: number) { this.cartService.remove(productId); }
  clear() { this.cartService.clear(); }

  checkout() {
    this.loading = true;
    this.errorMsg = '';

    this.cartService.checkout().subscribe({
      next: (order: any) => {
        this.loading = false;
        this.cartService.clear();
        alert('Commande enregistrée ✅ ID = ' + order?.id);
        this.router.navigateByUrl('/catalog');
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Checkout failed';
      }
    });
  }
}
