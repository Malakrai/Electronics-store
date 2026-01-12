import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { CartItem, CartService, CheckoutResponse } from '../../../services/cart.service';
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
    // Vérifier que le panier n'est pas vide
    const items = this.cartService.getCurrentItems();
    if (items.length === 0) {
      this.errorMsg = 'Votre panier est vide.';
      return;
    }

    // Si non connecté, rediriger vers login avec le bon returnUrl
    if (!this.authService.isAuthenticated()) {
      alert('Vous devez vous connecter pour passer une commande.');
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url // URL actuelle (/cart)
        }
      });
      return;
    }

    // Si connecté mais pas en tant que CUSTOMER
    if (!this.authService.isCustomer()) {
      alert('Vous devez être connecté en tant que client pour passer une commande.');
      this.authService.logout(); // Déconnexion forcée
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: '/cart',
          message: 'Veuillez vous connecter avec un compte client'
        }
      });
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.cartService.checkout().subscribe({
      next: (response: CheckoutResponse) => {
        this.loading = false;

        const orderDetails = `
Commande validée avec succès !

Numéro de commande: #${response.orderId}
Montant total: ${response.totalAmount.toFixed(2)} €
Date: ${new Date(response.orderDate).toLocaleDateString('fr-FR')}
        `;

        alert(orderDetails);

        // Vider le panier
        this.cartService.clear();

        // Rediriger vers checkout avec l'ID de commande
        if (response.orderId) {
          this.router.navigate(['/checkout', response.orderId]);
        } else {
          this.router.navigate(['/checkout']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.handleCheckoutError(err);
      }
    });
  }

  private handleCheckoutError(err: any): void {
    console.error('Erreur checkout:', err);

    let message = 'Erreur lors de la validation de la commande.';

    if (err.status === 401) {
      message = 'Session expirée. Veuillez vous reconnecter.';
      this.authService.logout();
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: '/cart',
          message: 'Session expirée'
        }
      });
      return;
    }

    if (err.status === 403) {
      message = 'Accès interdit. Rôle CLIENT requis.';
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: '/cart',
          message: 'Compte client requis'
        }
      });
      return;
    }

    if (err.status === 400) {
      message = err.error?.message || 'Données de commande invalides.';
    }

    if (err.status === 404) {
      message = 'Produit non disponible.';
    }

    if (err.status === 500) {
      message = 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    this.errorMsg = message;
    alert(message);
  }

  // Méthode pour voir si l'utilisateur peut passer commande
  canCheckout(): boolean {
    return this.authService.isAuthenticated() && this.authService.isCustomer();
  }
}
