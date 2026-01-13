import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { StatisticsService } from '../../../services/statistics.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;

  stats = {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    activeUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    monthlyGrowth: 0
  };

  isLoading = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private statisticsService: StatisticsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadRealStats();
  }

  loadRealStats(): void {
    this.isLoading = true;

    // Charger les vraies statistiques
    this.loadUsersStats();
    this.loadProductsStats();
    this.loadOrdersStats();
    this.loadRevenueStats();
  }

  private loadUsersStats(): void {
    // Utiliser le service de statistiques pour le nombre total de clients
    this.statisticsService.getTotalCustomers().subscribe({
      next: (totalCustomers) => {
        this.stats.totalUsers = totalCustomers;

        // Pour les utilisateurs actifs, on peut utiliser l'API users
        this.apiService.getUsers().subscribe({
          next: (users) => {
            // Mettre à jour aussi le nombre total d'utilisateurs si différent
            if (users.length > totalCustomers) {
              this.stats.totalUsers = users.length;
            }

            this.stats.activeUsers = users.filter(
              (user: any) => user.enabled === true || user.active === true
            ).length;

            this.checkLoadingComplete();
          },
          error: () => {
            this.checkLoadingComplete();
          }
        });
      },
      error: () => {
        // Fallback sur l'API users si le service stats échoue
        this.apiService.getUsers().subscribe({
          next: (users) => {
            this.stats.totalUsers = users.length;
            this.stats.activeUsers = users.filter(
              (user: any) => user.enabled === true || user.active === true
            ).length;
            this.checkLoadingComplete();
          },
          error: () => {
            this.checkLoadingComplete();
          }
        });
      }
    });
  }

  private loadProductsStats(): void {
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.stats.totalProducts = products.length;
        this.stats.lowStockProducts = products.filter(
          (product: any) => product.stock < 10
        ).length;
        this.checkLoadingComplete();
      },
      error: () => {
        this.checkLoadingComplete();
      }
    });
  }

  private loadOrdersStats(): void {
    this.statisticsService.getTotalOrders().subscribe({
      next: (totalOrders) => {
        this.stats.totalOrders = totalOrders;
        this.checkLoadingComplete();
      },
      error: () => {
        // Fallback: estimer le nombre de commandes du mois
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Si vous avez une API pour les commandes, utilisez-la
        // Sinon, on garde la valeur actuelle
        this.checkLoadingComplete();
      }
    });
  }

  private loadRevenueStats(): void {
    this.statisticsService.getTotalRevenue().subscribe({
      next: (totalRevenue) => {
        this.stats.totalRevenue = totalRevenue;
        this.checkLoadingComplete();
      },
      error: () => {
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // Vérifier si toutes les données sont chargées
    if (this.stats.totalUsers > 0 || this.stats.totalProducts > 0) {
      this.isLoading = false;
    }

    // Timeout de sécurité
    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToUsersCrud(): void {
    this.router.navigate(['/admin/users']);
  }

  statistiques(): void {
    this.router.navigate(['/admin/statistics']);
  }
}
