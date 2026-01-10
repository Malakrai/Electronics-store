/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-magasinier-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './magasinier-dashboard.html',
  styleUrls: ['./magasinier-dashboard.css']
})
export class MagasinierDashboard implements OnInit {
  currentUser: User | null = null;
  stats = {
    lowStock: 8,
    pendingOrders: 15,
    totalProducts: 342,
    todayOrders: 7
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  manageInventory(): void {
    this.router.navigate(['/magasinier/products']);
  }

  processOrders(): void {
    console.log('Navigate to orders processing');
  }
}*/


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

import { fadeUp, staggerList, cardPop } from './dashboard.animations';

@Component({
  selector: 'app-magasinier-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './magasinier-dashboard.html',
  styleUrls: ['./magasinier-dashboard.css'],
  animations: [fadeUp, staggerList, cardPop]
})
export class MagasinierDashboard implements OnInit {

  currentUser: User | null = null;

  // ✅ Pour éviter tes erreurs TS2339, on garde aussi des variables directes
  lowStockCount = 8;
  pendingOrdersCount = 15;
  totalProductsInStock = 342;
  todayOrdersCount = 7;

  // Optionnel (si tu veux un tableau "alertes")
  lowStockAlerts = [
    { name: 'Casque Bluetooth', category: 'Audio', stock: 3, threshold: 10 },
    { name: 'Clavier Mécanique', category: 'Accessoires', stock: 5, threshold: 12 },
    { name: 'SSD 1To', category: 'Stockage', stock: 2, threshold: 8 }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser?.() ?? null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToStocks(): void {
    this.router.navigate(['/magasinier/products']);
  }

  goToOrders(): void {
    // adapte selon tes routes
    this.router.navigate(['/magasinier/orders']);
  }

  goToInventory(): void {
    // adapte selon tes routes
    this.router.navigate(['/magasinier/inventory']);
  }

  restock(productName: string): void {
    alert(`Réapprovisionnement demandé pour: ${productName}`);
  }
}

