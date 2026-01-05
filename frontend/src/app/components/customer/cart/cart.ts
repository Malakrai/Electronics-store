import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { CartItem, CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';

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
  private readonly authService = inject(AuthService);

  items$: Observable<CartItem[]> = this.cartService.items$;
  total$: Observable<number> = this.cartService.total$;

  loading = false;
  errorMsg = '';

  inc(productId: number) { this.cartService.increase(productId); }
  dec(productId: number) { this.cartService.decrease(productId); }
  remove(productId: number) { this.cartService.remove(productId); }
  clear() { this.cartService.clear(); }

  checkout() {
    if (!this.authService.isAuthenticated()) {
      alert('Vous devez être connecté pour passer une commande.');

      // On passe la page actuelle (livraison) comme returnUrl
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/delivery' }
      });
      return;
    }

    if (!this.authService.isCustomer()) {
      alert('Vous devez être connecté en tant que customer pour passer une commande.');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/delivery' }
      });
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.cartService.checkout().subscribe({
      next: () => {
        this.loading = false;
        this.cartService.clear();
        alert('Commande validée avec succès');
        this.router.navigateByUrl('/catalog');
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 401) {
          alert('Session expirée. Veuillez vous reconnecter.');
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/delivery' } });
        }
        else if (err.status === 403) {
          alert('Accès interdit. Rôle CUSTOMER requis.');
        }
        else {
          this.errorMsg = err?.error || 'Erreur lors du checkout';
        }
      }
    });
  }

}
