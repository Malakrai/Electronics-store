import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
  <header class="topbar">
    <div class="topbar__left">
      <div class="brand" routerLink="/checkout" title="ElectroPay">
        <span class="brand__logo">E</span>
        <div>
          <div class="brand__name">ELECTROPAY</div>
          <div class="brand__tag">Factures & Paiements</div>
        </div>
      </div>
    </div>

    <div class="topbar__center">
      <input class="search" placeholder="Rechercher un produit, une commande, une facture..." />
    </div>

    <nav class="topbar__right">
      <a routerLink="/orders" class="navlink">Mes commandes</a>
      <a routerLink="/invoices" class="navlink">Mes factures</a>
      <a routerLink="/payment-methods" class="navlink">Moyens de paiement</a>
      <a routerLink="/checkout" class="cart">
        <span class="cart__icon">🛒</span>
        <span class="cart__text">Panier</span>
      </a>
    </nav>
  </header>
  `,
})
export class HeaderComponent {}
