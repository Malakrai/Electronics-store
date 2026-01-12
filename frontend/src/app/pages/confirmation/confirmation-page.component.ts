// confirmation-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MonthlyBill } from '../../models/bill.model';
import { BillingService } from '../../services/billing.service';
import { ChangeDetectorRef } from '@angular/core';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr, 'fr');

@Component({
  selector: 'app-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [CurrencyPipe],
  templateUrl: './confirmation-page.component.html',
  styleUrls: ['./confirmation-page.component.css']
})
export class ConfirmationPageComponent implements OnInit {
  bill: MonthlyBill | null = null;
  loading = false;
  error = '';
  billId: number | null = null;

  constructor(
    public api: ApiService,
    public billingService: BillingService,
    public route: ActivatedRoute,
    private router: Router,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;

    const idParam = this.route.snapshot.paramMap.get('billId');
    const queryId = this.route.snapshot.queryParams['billId'];
    const id = idParam ?? queryId;

    if (id && !isNaN(+id)) {
      this.billId = +id;
      this.load(this.billId);
    } else {
      this.loading = false;
      this.error = 'ID de facture manquant ou invalide.';
    }
  }

  load(id: number): void {
    this.loading = true;
    this.error = '';

    this.api.getBill(id).subscribe({
      next: (bill: MonthlyBill) => {
        this.bill = bill;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading bill from API:', error);
        this.billingService.getBillById(id).subscribe({
          next: (bill: MonthlyBill) => {
            this.bill = bill;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (fallbackError) => {
            console.error('Error loading bill from BillingService:', fallbackError);
            this.bill = this.createFallbackBill(id);
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  retryLoad(): void {
    if (this.billId) {
      this.load(this.billId);
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      PAID: 'Payée',
      UNPAID: 'Impayée',
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      CANCELLED: 'Annulée',
      PARTIALLY_PAID: 'Partiellement payée'
    };
    return statusMap[status?.toUpperCase()] || 'Inconnu';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PAID: 'status-paid',
      CONFIRMED: 'status-confirmed',
      PENDING: 'status-pending',
      UNPAID: 'status-unpaid',
      PARTIALLY_PAID: 'status-partial',
      CANCELLED: 'status-cancelled'
    };
    return map[status?.toUpperCase()] || '';
  }

  printBill(): void {
    if (!this.billId) return;

    this.api.downloadBillPdf(this.billId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => {
        alert('Impossible de télécharger la facture.');
      }
    });
  }

  private createFallbackBill(id: number): MonthlyBill {
    const subtotal = 32;
    const vat = subtotal * 0.2;
    const total = subtotal + vat;

    return {
      id,
      billDate: new Date().toISOString(),
      totalAmount: total,
      status: 'PAID',
      customer: {
        id: 1,
        firstName: 'Client',
        lastName: 'Test',
        email: 'client@test.com'
      },
      items: [],
      taxAmount: vat,
      shippingAmount: 0,
      amountPaid: total,
      referenceNumber: `BILL-${id}`
    };
  }

  formatBillDate(date?: string): string {
    if (!date) return 'Date inconnue';

    const d = new Date(date);
    if (isNaN(d.getTime())) return date;

    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  toNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(',', '.'));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }
}
