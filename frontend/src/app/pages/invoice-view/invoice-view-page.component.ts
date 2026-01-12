import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BillingService } from '../../services/billing.service';
import { MonthlyBill, PaymentMethod, BillStatus, Customer } from '../../models/bill.model';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr, 'fr');

@Component({
  selector: 'app-invoice-view-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './invoice-view-page.component.html',
  styleUrls: ['./invoice-view-page.component.css']
})
export class InvoiceViewPageComponent implements OnInit {
  bill: MonthlyBill | null = null;
  loading = true;
  error = '';
  printMode = false;
  showDebug = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'] || params['billId'];
      console.log('🔍 ID récupéré:', id);

      if (id && !isNaN(+id)) {
        this.loadBill(+id);
      } else {
        this.error = `ID de facture invalide: ${id}`;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadBill(id: number): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    console.log('📞 Appel API pour la facture', id);

    this.billingService.getBillById(id).subscribe({
      next: (bill) => {
        console.log('📦 Données brutes de la facture:', bill);
        console.log('👤 Customer brut:', bill.customer);

        const processedBill = { ...bill };

        // Normalisation des items
        if (!processedBill.items && processedBill.billItems) {
          processedBill.items = processedBill.billItems;
        }
        if (!processedBill.items) processedBill.items = [];

        // S'assurer que le customer existe et a les propriétés nécessaires
        processedBill.customer = this.normalizeCustomer(processedBill.customer, id);

        console.log('✅ Customer après normalisation:', processedBill.customer);

        this.bill = processedBill;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur de chargement de la facture';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private normalizeCustomer(customer: any, billId: number): Customer {
    console.log('🔄 Normalisation du customer:', customer);

    // Cas 1: customer est null ou undefined
    if (!customer) {
      console.log('⚠️ Customer est null/undefined, création d\'un fallback');
      return {
        id: billId,
        firstName: 'Client',
        lastName: 'Non spécifié',
        email: '',
        phone: ''
      };
    }

    // Cas 2: customer est un ID (nombre ou chaîne)
    if (typeof customer === 'number' || typeof customer === 'string') {
      console.log('ℹ️ Customer est un ID:', customer);
      return {
        id: Number(customer),
        firstName: 'Client',
        lastName: '#' + customer,
        email: '',
        phone: ''
      };
    }

    // Cas 3: customer est un objet mais peut-être vide ou avec des propriétés différentes
    if (typeof customer === 'object') {
      // Vérifier si c'est un objet vide
      if (Object.keys(customer).length === 0) {
        console.log('⚠️ Customer est un objet vide');
        return {
          id: billId,
          firstName: 'Client',
          lastName: 'Non spécifié',
          email: '',
          phone: ''
        };
      }

      // Essayer de trouver les propriétés avec différents noms possibles
      const normalized: Customer = {
        id: this.extractProperty(customer, ['id', 'customerId', 'userId', 'clientId'], billId),
        firstName: this.extractProperty(customer, ['firstName', 'firstname', 'name', 'username', 'nom', 'prenom'], 'Client'),
        lastName: this.extractProperty(customer, ['lastName', 'lastname', 'surname', 'familyName'], ''),
        email: this.extractProperty(customer, ['email', 'mail', 'e-mail'], ''),
        phone: this.extractProperty(customer, ['phone', 'telephone', 'mobile', 'phoneNumber'], '')
      };

      console.log('✅ Customer normalisé:', normalized);
      return normalized;
    }

    // Fallback par défaut
    console.log('⚠️ Type de customer inconnu, fallback');
    return {
      id: billId,
      firstName: 'Client',
      lastName: 'Facture #' + billId,
      email: '',
      phone: ''
    };
  }

  private extractProperty(obj: any, propertyNames: string[], defaultValue: any): any {
    for (const propName of propertyNames) {
      if (obj[propName] !== undefined && obj[propName] !== null && obj[propName] !== '') {
        return obj[propName];
      }
    }
    return defaultValue;
  }

  // Méthodes utilitaires pour le template
  get itemsLength(): number {
    return this.bill?.items?.length ?? 0;
  }

  get totalAmount(): number {
    return this.bill?.totalAmount ?? 0;
  }

  getStatusLabel(status: BillStatus): string {
    const statusMap: Record<BillStatus, string> = {
      'PENDING': 'En attente',
      'UNPAID': 'Impayée',
      'PAID': 'Payée',
      'CANCELLED': 'Annulée',
      'CANCELED': 'Annulée',
      'PARTIALLY_PAID': 'Partiellement payée'
    };
    return statusMap[status] || status;
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '0,00 €';
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${amount.toFixed(2).replace('.', ',')} €`;
    }
  }

  downloadPdf(): void {
    if (!this.bill) return;

    console.log('📄 Téléchargement du PDF pour la facture:', this.bill.id);

    this.billingService.downloadBillPdf(this.bill.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${this.bill?.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        console.log('✅ PDF téléchargé avec succès');
      },
      error: (error) => {
        console.error('❌ Erreur lors du téléchargement:', error);
        alert('Erreur lors du téléchargement du PDF. Veuillez réessayer.');
      }
    });
  }

  goToPayment(): void {
    if (this.bill) {
      console.log('💳 Redirection vers le paiement:', this.bill.id);
      this.router.navigate(['/checkout', this.bill.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  canPay(): boolean {
    if (!this.bill) return false;
    const payableStatuses: BillStatus[] = ['PENDING', 'UNPAID', 'PARTIALLY_PAID'];
    return payableStatuses.includes(this.bill.status);
  }

  printInvoice(): void {
    window.print();
  }

  // Méthodes utilitaires pour le client (sécurisées)
  hasCustomerInfo(): boolean {
    if (!this.bill?.customer) {
      console.log('❌ Pas de customer dans la facture');
      return false;
    }

    const customer = this.bill.customer;

    // Vérifier si au moins une propriété a une valeur
    const hasInfo = !!(customer.id ||
                      customer.firstName ||
                      customer.lastName ||
                      customer.email ||
                      customer.phone);

    console.log('🔍 Vérification infos client - Résultat:', hasInfo);
    return hasInfo;
  }

  getCustomerFullName(): string {
    if (!this.bill?.customer) {
      return 'Client non spécifié';
    }

    const customer = this.bill.customer;

    // Essayer de construire un nom complet
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    }

    // Fallback: utiliser l'email si disponible
    if (customer.email) {
      return customer.email;
    }

    // Fallback: utiliser l'ID
    if (customer.id) {
      return `Client #${customer.id}`;
    }

    return 'Client non spécifié';
  }

  getCustomerEmail(): string {
    return this.bill?.customer?.email || '';
  }

  getCustomerPhone(): string {
    return this.bill?.customer?.phone || '';
  }

  // CORRECTION ICI : Retourne toujours un nombre
  getCustomerId(): number {
    const id = this.bill?.customer?.id;
    if (id === undefined || id === null) return 0;

    // Convertir en nombre si possible
    const numId = Number(id);
    return isNaN(numId) ? 0 : numId;
  }

  // Méthode pour afficher l'ID comme chaîne
  getCustomerIdDisplay(): string {
    const id = this.getCustomerId();
    return id > 0 ? String(id) : 'N/A';
  }

  // Méthodes de débogage
  getCustomerDebugInfo(): any {
    if (!this.bill?.customer) return null;

    return {
      raw: this.bill.customer,
      id: this.bill.customer.id,
      firstName: this.bill.customer.firstName,
      lastName: this.bill.customer.lastName,
      email: this.bill.customer.email,
      phone: this.bill.customer.phone,
      hasCustomerInfo: this.hasCustomerInfo(),
      customerFullName: this.getCustomerFullName()
    };
  }

  toggleDebug(): void {
    this.showDebug = !this.showDebug;
  }
}
