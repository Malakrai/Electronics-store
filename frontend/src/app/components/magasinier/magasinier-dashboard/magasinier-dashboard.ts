import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { ProductService } from '../../../services/product.service';
import { User } from '../../../models/user.model';

// Import des animations (leur ajout)
import { fadeUp, staggerList, cardPop } from './dashboard.animations';

@Component({
  selector: 'app-magasinier-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './magasinier-dashboard.html',
  styleUrls: ['./magasinier-dashboard.css'],
  animations: [fadeUp, staggerList, cardPop]  // Leur ajout
})
export class MagasinierDashboard implements OnInit {
  currentUser: User | null = null;
  todayDate = new Date();

  stats = {
    lowStock: 0,
    pendingOrders: 0,
    totalProducts: 0,
    todayOrders: 0
  };

  // Leur ajout - alertes bas stock
  lowStockAlerts: any[] = [];

  isLoading = true;
  errorMessage = '';
  private callsCompleted = 0;
  private totalCalls = 2;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.callsCompleted = 0;

    // 1. Charger les produits
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.stats.totalProducts = products?.length || 0;

        // Calculer produits en bas stock
        const lowStockProducts = products?.filter(
          (product: any) => (product.stockQuantity || product.stock || 0) < 10
        ) || [];

        this.stats.lowStock = lowStockProducts.length;

        // Préparer les alertes (leur fonctionnalité)
        this.lowStockAlerts = lowStockProducts.map((product: any) => ({
          name: product.name || product.productName,
          category: product.category || 'Non catégorisé',
          stock: product.stockQuantity || product.stock || 0,
          threshold: 10
        }));

        this.markCallCompleted();
      },
      error: (error) => {
        console.error('Erreur chargement produits:', error);
        this.errorMessage = 'Erreur lors du chargement des produits';
        this.markCallCompleted();
      }
    });

    // 2. Charger les commandes
    this.apiService.getAllBills().subscribe({
      next: (bills) => {
        this.stats.pendingOrders = bills?.filter(
          (bill: any) => bill.status === 'PENDING' || bill.status === 'UNPAID'
        ).length || 0;

        const today = new Date().toISOString().split('T')[0];
        this.stats.todayOrders = bills?.filter((bill: any) => {
          if (!bill?.billDate) return false;
          return bill.billDate.startsWith(today);
        }).length || 0;

        this.markCallCompleted();
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
        this.errorMessage = 'Erreur lors du chargement des commandes';
        this.markCallCompleted();
      }
    });
  }

  private markCallCompleted(): void {
    this.callsCompleted++;
    if (this.callsCompleted >= this.totalCalls) {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Vos méthodes originales
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  manageInventory(): void {
    this.router.navigate(['/magasinier/products']);
  }

  processOrders(): void {
    this.router.navigate(['/magasinier/commandes']);
  }

  restock(productName: string): void {
    alert(`Réapprovisionnement demandé pour: ${productName}`);
  }
}
