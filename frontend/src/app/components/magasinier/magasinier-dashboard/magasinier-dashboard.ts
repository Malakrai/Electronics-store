import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { ProductService } from '../../../services/product.service';
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
  todayDate = new Date();

  stats = {
    lowStock: 0,
    pendingOrders: 0,
    totalProducts: 0,
    todayOrders: 0
  };

  isLoading = true;
  errorMessage = '';
  private callsCompleted = 0;
  private totalCalls = 2;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef // Ajoutez ceci
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.callsCompleted = 0;

    console.log('Début du chargement des statistiques...');

    // 1. Charger les produits
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('✅ Produits chargés:', products?.length || 0);
        this.stats.totalProducts = products?.length || 0;

        this.stats.lowStock = products?.filter(
          (product: any) => (product.stockQuantity || product.stock || 0) < 10
        ).length || 0;

        this.markCallCompleted();
      },
      error: (error) => {
        console.error('❌ Erreur chargement produits:', error);
        this.errorMessage = 'Erreur lors du chargement des produits';
        this.markCallCompleted();
      }
    });

    // 2. Charger les commandes
    this.apiService.getAllBills().subscribe({
      next: (bills) => {
        console.log('✅ Factures chargées:', bills?.length || 0);

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
        console.error('❌ Erreur chargement commandes:', error);
        this.errorMessage = 'Erreur lors du chargement des commandes';
        this.markCallCompleted();
      }
    });
  }

  private markCallCompleted(): void {
    this.callsCompleted++;
    console.log(`📊 Appels terminés: ${this.callsCompleted}/${this.totalCalls}`);

    if (this.callsCompleted >= this.totalCalls) {
      console.log('✅ Tous les appels sont terminés');
      this.isLoading = false;
      this.cdr.detectChanges(); // FORCE la détection de changement
    }
  }

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
}
