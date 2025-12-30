import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.css']
})
export class CustomerDashboard implements OnInit {
  currentUser: User | null = null;
  customerStats = {
    totalOrders: 0,
    pendingOrders: 0,
    loyaltyPoints: 0,
    favoriteCategory: 'Électronique'
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

  browseProducts(): void {
    this.router.navigate(['/products']); // à ajuster selon ton app
  }

  viewOrders(): void {
    this.router.navigate(['/customer/orders']); // à ajuster selon ton app
  }

  goToProfile(): void {
    this.router.navigate(['/customer/profile']);
  }
}
