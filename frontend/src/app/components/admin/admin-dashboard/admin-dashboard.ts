import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
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
    activeUsers: 0
  };

  isLoading = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;

    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.stats.totalUsers = users.length;

        // ✔ Correction : on vérifie si enabled existe
        this.stats.activeUsers = users.filter(
          (user: User) => (user as any).enabled === true
        ).length;

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
      }
    });

    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.stats.totalProducts = products.length;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  goToUsersCrud() {
      this.router.navigate(['/admin/users']);
  }

  manageProducts(): void {
    console.log('Navigate to product management');
  }
}
