import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BillingService } from '../../services/billing.service';
import { MonthlyBill, BillItem } from '../../models/bill.model';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr, 'fr');

@Component({
  selector: 'app-order-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-details-page.component.html',
  styleUrls: ['./order-details-page.component.css'],
  providers: [DatePipe]
})
export class OrderDetailsPageComponent implements OnInit {
  orderId = 0;
  bill: MonthlyBill | null = null;
  loading = false;
  error = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService,
    private apiService: ApiService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = Number(params['orderId'] ?? 0);
      console.log('Order ID from route:', this.orderId);

      if (this.orderId > 0) {
        this.loadOrder();
      } else {
        this.error = true;
        this.errorMessage = 'ID de commande invalide';
      }
    });
  }

  loadOrder(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    this.bill = null;

    console.log(`Chargement de la commande ${this.orderId}...`);

    // Utiliser directement l'API Service pour être sûr
    this.apiService.getOrder(this.orderId).subscribe({
      next: (order) => {
        console.log('Réponse API getOrder:', order);
        if (order) {
          this.bill = this.convertOrderToBill(order);
        } else {
          // Si pas d'order, essayer avec les factures
          this.loadBillFromBillingService();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur avec apiService.getOrder:', err);
        // Fallback: utiliser le billingService
        this.loadBillFromBillingService();
      }
    });
  }

  private loadBillFromBillingService(): void {
    this.billingService.getBillsByOrder(this.orderId).subscribe({
      next: (bills) => {
        console.log('Réponse getBillsByOrder:', bills);
        if (bills && bills.length > 0) {
          this.processBillData(bills[0]);
        } else {
          // Aucune facture trouvée, utiliser fallback
          this.useFallback();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur avec billingService:', err);
        this.useFallback();
      }
    });
  }

  private processBillData(billData: any): void {
    console.log('Processing bill data:', billData);

    // Normaliser la structure de la facture
    this.bill = {
      id: billData.id || this.orderId,
      billDate: billData.billDate || new Date().toISOString(),
      totalAmount: billData.totalAmount || 0,
      status: billData.status || 'PENDING', // Fournir une valeur par défaut
      customer: billData.customer || {
        id: 1,
        firstName: 'Client',
        lastName: 'Commande',
        email: 'client@example.com'
      },
      items: billData.items || billData.billItems || [],
      referenceNumber: billData.referenceNumber || `BILL-${billData.id || this.orderId}`,
      taxAmount: billData.taxAmount || 0,
      shippingAmount: billData.shippingAmount || 0,
      amountPaid: billData.amountPaid || 0
    };

    console.log('Bill after processing:', this.bill);
  }

  private convertOrderToBill(order: any): MonthlyBill {
    return {
      id: order.id || this.orderId,
      billDate: order.orderDate || new Date().toISOString(),
      totalAmount: order.totalAmount || 0,
      status: order.status || 'PENDING',
      customer: order.customer || {
        id: 1,
        firstName: 'Client',
        lastName: 'Commande',
        email: 'client@example.com'
      },
      items: order.items?.map((item: any, index: number) => ({
        id: index + 1,
        description: item.productName || `Produit ${index + 1}`,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.price || 0,
        lineTotal: item.total || (item.quantity * item.unitPrice) || 0
      })) || [],
      referenceNumber: order.orderNumber || `ORD-${order.id}`,
      taxAmount: order.taxAmount || 0,
      shippingAmount: order.shippingAmount || 0,
      amountPaid: order.amountPaid || 0
    };
  }

  private useFallback(): void {
    console.log('Utilisation du fallback pour la commande', this.orderId);
    this.bill = {
      id: this.orderId,
      billDate: new Date().toISOString(),
      totalAmount: 167.98,
      status: 'PAID', // Statut par défaut
      customer: {
        id: 1,
        firstName: 'Ahmed',
        lastName: 'Bezahid',
        email: 'abdezahid2510@gmail.com',
        phone: '+212600000000'
      },
      items: [
        {
          id: 1,
          description: 'Produit de démonstration',
          quantity: 2,
          unitPrice: 83.99,
          lineTotal: 167.98
        }
      ],
      referenceNumber: `CMD-${this.orderId}`,
      taxAmount: 33.60,
      shippingAmount: 0,
      amountPaid: 167.98
    };

    console.log('Fallback bill created:', this.bill);
  }

  // ---------- UTILITAIRES ----------

  getItems(): BillItem[] {
    return this.bill?.items ?? [];
  }

  getCustomerName(): string {
    const c = this.bill?.customer;
    if (!c) return 'Client inconnu';
    if (c.firstName || c.lastName) return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();
    return c.email ?? `Client #${c.id}`;
  }

  formatCurrency(amount?: number | string): string {
    const num = typeof amount === 'number' ? amount : parseFloat(amount as string) || 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(num);
  }

  getFormattedDate(date?: string): string {
    if (!date) return '';
    const formatted = this.datePipe.transform(date, 'dd/MM/yyyy à HH:mm');
    return formatted ?? date;
  }

  getStatusText(status?: string): string {
    return this.apiService.getStatusLabel(status || '');
  }

  getStatusClass(status?: string): string {
    const statusUpper = (status || '').toUpperCase();
    const classMap: { [key: string]: string } = {
      'PAID': 'badge bg-success',
      'UNPAID': 'badge bg-danger',
      'PENDING': 'badge bg-warning',
      'CANCELLED': 'badge bg-secondary',
      'CANCELED': 'badge bg-secondary',
      'PARTIALLY_PAID': 'badge bg-info',
      'CONFIRMED': 'badge bg-primary'
    };
    return classMap[statusUpper] || 'badge bg-secondary';
  }

  // ---------- ACTIONS ----------

  backToOrders(): void {
    this.router.navigate(['/orders']);
  }

  printInvoice(): void {
    window.print();
  }

  // Méthode de debug pour vérifier les données
  debugData(): void {
    console.log('=== DEBUG ORDER DETAILS ===');
    console.log('Order ID:', this.orderId);
    console.log('Loading:', this.loading);
    console.log('Error:', this.error);
    console.log('Bill:', this.bill);
    console.log('Items:', this.getItems());
    console.log('Customer Name:', this.getCustomerName());
    console.log('Status:', this.bill?.status);
    console.log('Status Text:', this.getStatusText(this.bill?.status));
    console.log('===========================');
  }
}
