import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="app">
      <header class="topbar">
        <div class="brand">
          <div class="logo">EV</div>
          <div>
            <div class="name">ElectroViolet</div>
            <div class="tag">Checkout • Paiements • Factures</div>
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
    </div>
  `
})
export class AppComponent {}
