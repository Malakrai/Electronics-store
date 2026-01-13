import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MonthlyBill, PaymentMethod } from '../../models/bill.model';

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './invoices-page.component.html',
  styleUrls: ['./invoices-page.component.css']
})
export class InvoicesPageComponent implements OnInit {
  bills: MonthlyBill[] = [];
  filteredBills: MonthlyBill[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  filterStatus = 'ALL';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.loading = true;
    this.error = '';

    this.api.getAllBills().subscribe({
      next: (bills) => {
        this.bills = bills || [];
        this.filteredBills = [...this.bills];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bills:', err);
        this.error = 'Impossible de charger les factures.';
        this.loading = false;
      }
    });
  }

  // Méthodes de calcul pour le template
  getTotalUnpaid(): number {
    return this.bills
      .filter(b => b.status === 'PENDING' || b.status === 'UNPAID')
      .reduce((sum, b) => sum + this.toNumber(b.totalAmount), 0);
  }

  getTotalPaid(): number {
    return this.bills
      .filter(b => b.status === 'PAID')
      .reduce((sum, b) => sum + this.toNumber(b.totalAmount), 0);
  }

  // Gestion des filtres
  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.bills];

    // Filtre par statut
    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(b => b.status === this.filterStatus);
    }

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b => {
        const hay = `${b.id} ${b.billDate || ''} ${this.getCustomerDisplayName(b).toLowerCase()} ${this.getCustomerEmail(b).toLowerCase()}`;
        return hay.includes(term);
      });
    }

    this.filteredBills = filtered;
  }

  // Safe methods for template
  getCustomerDisplayName(bill: MonthlyBill): string {
    if (!bill.customer) {
      return `Client #${bill.customerId || 'N/A'}`;
    }

    const firstName = bill.customer.firstName || '';
    const lastName = bill.customer.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || bill.customer.email || `Client #${bill.customerId || 'N/A'}`;
  }

  getCustomerEmail(bill: MonthlyBill): string {
    return bill.customer?.email || '';
  }

  getCustomerPhone(bill: MonthlyBill): string {
    return bill.customer?.phone || '';
  }

  getFormattedDate(dateStr?: string): string {
    return this.api.getFormattedDate(dateStr);
  }

  getStatusLabel(status: string): string {
    return this.api.getStatusLabel(status);
  }

  // Alias pour le template
  getStatusText(status: string): string {
    return this.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    const statusClassMap: {[key: string]: string} = {
      'PAID': 'status-paid',
      'PENDING': 'status-pending',
      'UNPAID': 'status-pending', // Same as pending
      'CANCELLED': 'status-canceled',
      'CANCELED': 'status-canceled'
    };
    return statusClassMap[status?.toUpperCase()] || 'status-unknown';
  }

  toNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  viewBill(billId: number): void {
    this.router.navigate(['/invoices', billId]);
  }

  createTestBill(): void {
    this.loading = true;
    this.api.createTestBill(1).subscribe({
      next: () => {
        this.loadBills();
      },
      error: (err) => {
        console.error('Error creating test bill:', err);
        this.error = 'Erreur lors de la création de la facture test.';
        this.loading = false;
      }
    });
  }

  downloadPdf(billId: number): void {
    this.api.downloadBillPdf(billId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${billId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading PDF:', err);
        alert('Erreur lors du téléchargement du PDF');
      }
    });
  }
}
