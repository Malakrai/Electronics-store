import { Component, OnInit } from '@angular/core';
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
    console.log('Navigate to inventory management');
  }

  processOrders(): void {
    console.log('Navigate to orders processing');
  }
}
