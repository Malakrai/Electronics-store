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
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/customer/cart' }
      });
      return;
    }

    if (!this.authService.isCustomer()) {
      alert('Vous devez être connecté en tant que client pour passer une commande.');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/customer/cart' }
      });
      return;
    }

    // Vérifier que le panier n'est pas vide
    const items = this.cartService.getCurrentItems();
    if (items.length === 0) {
      this.errorMsg = 'Votre panier est vide.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.cartService.checkout().subscribe({
      next: (orderResponse) => {
        this.loading = false;

        // Afficher les détails de la commande
        const orderDetails = `
Commande validée avec succès !

Numéro de commande: #${orderResponse.orderId}
Montant total: ${orderResponse.totalAmount.toFixed(2)} €
Date: ${new Date(orderResponse.orderDate).toLocaleDateString('fr-FR')}

Une facture a été générée et est disponible dans la section "Mes factures".
        `;

        alert(orderDetails);

        // Vider le panier
        this.cartService.clear();

        // IMPORTANT : Rediriger vers la page de facturation
        this.router.navigate(['/customer/delivery']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur checkout:', err);

        if (err.status === 401) {
          alert('Session expirée. Veuillez vous reconnecter.');
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: '/customer/cart' }
          });
        }
        else if (err.status === 403) {
          alert('Accès interdit. Rôle CLIENT requis.');
          this.router.navigate(['/login']);
        }
        else if (err.status === 400) {
          this.errorMsg = err.error?.message || 'Données de commande invalides.';
        }
        else if (err.status === 404) {
          this.errorMsg = 'Produit non disponible.';
        }
        else {
          this.errorMsg = err?.error?.message || 'Erreur lors de la validation de la commande.';
        }
      }
    });
  }
}
