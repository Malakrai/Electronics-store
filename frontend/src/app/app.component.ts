import { Component } from '@angular/core';
<<<<<<< HEAD
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
=======
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
>>>>>>> origin/ayoub

@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< HEAD
  imports: [
    RouterOutlet,
    HttpClientModule   // ⚠️ nécessaire pour permettre les requêtes HTTP
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
=======
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
>>>>>>> origin/ayoub
})
export class AppComponent {}
