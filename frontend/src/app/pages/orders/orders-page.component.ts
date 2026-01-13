import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MonthlyBill, PaymentMethod } from '../../models/bill.model';
@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css']
})
export class OrdersPageComponent implements OnInit {
  orders: MonthlyBill[] = [];
  filteredOrders: MonthlyBill[] = [];
  loading = false;
  error = '';
  q = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';

    this.api.getAllBills().subscribe({
      next: (bills) => {
        this.orders = bills || [];
        this.updateFilteredOrders();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Impossible de charger les commandes.';
        this.loading = false;
      }
    });
  }

  // Met à jour filteredOrders en fonction de la recherche
  updateFilteredOrders(): void {
    const term = this.q.trim().toLowerCase();
    if (!term) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => {
        const customerEmail = order.customer?.email || '';
        const customerFirstName = order.customer?.firstName || '';
        const customerLastName = order.customer?.lastName || '';
        const billDate = order.billDate || '';

        const hay = `${order.id} ${customerEmail} ${customerFirstName} ${customerLastName} ${billDate}`.toLowerCase();
        return hay.includes(term);
      });
    }
  }

  // Appelé à chaque modification de la recherche
  onSearchChange(): void {
    this.updateFilteredOrders();
  }

  getCustomerEmail(order: MonthlyBill): string {
    return order.customer?.email || 'Email non fourni';
  }

  getFormattedDate(dateStr?: string): string {
    return this.api.getFormattedDate(dateStr);
  }

  getDisplayStatus(status: string): string {
    if (!status) return 'Inconnu';
    switch(status.toUpperCase()) {
      case 'PAID': return 'Payé';
      case 'PENDING': return 'En attente';
      case 'CANCELED':
      case 'CANCELLED': return 'Annulé';
      case 'UNPAID': return 'Impayé';
      default: return status;
    }
  }

  toNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/invoices', orderId]);
  }

  getCustomerFullName(order: MonthlyBill): string {
    if (!order.customer) return 'Client inconnu';
    const firstName = order.customer.firstName || '';
    const lastName = order.customer.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || order.customer.email || 'Client inconnu';
  }
}
