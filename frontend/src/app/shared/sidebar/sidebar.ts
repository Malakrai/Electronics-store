import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isOpen = false;

  toggle() { this.isOpen = !this.isOpen; }
  close() { this.isOpen = false; }

  isAuthenticated(): boolean { return this.authService.isAuthenticated(); }
  isCustomer(): boolean { return this.authService.isCustomer(); }

  logout() {
    this.authService.logout();
    this.close();
    this.router.navigateByUrl('/login');
  }

  goTo(path: string) {
    this.close();
    this.router.navigateByUrl(path);
  }
}
