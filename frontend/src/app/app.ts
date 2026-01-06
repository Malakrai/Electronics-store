import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <header class="topbar">
    <div class="brand" routerLink="/">
      <div class="logo">EV</div>
      <div>
        <div class="brandTitle">ElectroViolet</div>
        <div class="brandSub">Checkout • Paiements • Factures</div>
      </div>
    </div>

    <nav class="nav">
      <a routerLink="/checkout" routerLinkActive="active">Checkout</a>
      <a routerLink="/orders" routerLinkActive="active">Mes commandes</a>
      <a routerLink="/invoices" routerLinkActive="active">Mes factures</a>
    </nav>
  </header>

  <main class="container">
    <router-outlet />
  </main>
  `,
})
export class App {}
