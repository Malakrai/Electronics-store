import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MonthlyBill, PaymentMethod } from '../../models/bill.model';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {
  step: Step = 1;
  loading = false;
  error = '';
  successMessage = '';

  // IDs
  orderId?: number;
  billId?: number;

  // Factures
  billToPay: MonthlyBill | null = null;
  billForSummary: MonthlyBill | null = null;

  // États supplémentaires
  creatingTestBill = false;
  createBillError = false;
  downloadingPdf = false;
  pdfError = false;

  // Calculs
  subtotal = 0;
  vat = 0;
  total = 0;

  // Formulaire
  address = {
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    zip: ''
  };

  shipping = {
    method: 'Standard' as 'Standard'|'Express',
    price: 0,
    eta: '3-5 jours'
  };

  // Paiement
  payment = {
    method: 'CARD' as PaymentMethod,
    cardName: '',
    cardNumber: '',
    exp: '',
    cvv: '',
    paypalEmail: '',
    iban: ''
  };

  // États
  isPaying = false;
  payError = false;
  termsAccepted = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    console.log('CheckoutPageComponent constructor');
  }

  ngOnInit(): void {
    console.log('CheckoutPageComponent ngOnInit');

    // S'abonner aux paramètres d'URL
    this.route.params.subscribe(params => {
      console.log('Route params:', params);
      if (params['orderId']) {
        this.orderId = +params['orderId'];
        console.log(`Order ID from route: ${this.orderId}`);
      }
    });

    // S'abonner aux query params
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      if (params['billId']) {
        this.billId = +params['billId'];
        console.log(`Bill ID from query: ${this.billId}`);
      }
      if (params['success']) {
        this.successMessage = params['success'] === 'true' ? 'Paiement réussi !' : '';
      }
    });

    // Charger les données après avoir récupéré les paramètres
    setTimeout(() => {
      this.loadCheckoutData();
    }, 0);
  }

  // MÉTHODES PUBLIQUES POUR LE TEMPLATE

  getFormattedDate(dateStr?: string): string {
    return this.api.getFormattedDate(dateStr);
  }

  getStatusText(status: string): string {
    return this.api.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    const statusClassMap: {[key: string]: string} = {
      'PAID': 'status-paid',
      'UNPAID': 'status-unpaid',
      'PENDING': 'status-pending',
      'CANCELLED': 'status-cancelled',
      'CANCELED': 'status-cancelled',
      'COMPLETED': 'status-paid',
      'FAILED': 'status-unpaid'
    };
    return statusClassMap[status] || 'status-unknown';
  }

  toNumber(value: any): number {
    return this.api.toNumber(value);
  }

  getCustomerFullName(): string {
    if (!this.billToPay?.customer) return 'Client inconnu';
    const firstName = this.billToPay.customer.firstName || '';
    const lastName = this.billToPay.customer.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Client inconnu';
  }

  getCustomerEmail(): string {
    return this.billToPay?.customer?.email || '';
  }

  // MÉTHODES DE CHARGEMENT

  loadBill(): void {
    this.loadCheckoutData();
  }

  loadCheckoutData(): void {
    console.log('loadCheckoutData called');

    if (this.loading) {
      console.log('⚠️ Already loading, skipping...');
      return;
    }

    this.ngZone.run(() => {
      this.loading = true;
      this.error = '';
      this.successMessage = '';

      // Force detection de changement immédiate
      this.cdr.detectChanges();

      console.log(`Loading checkout data - OrderID: ${this.orderId}, BillID: ${this.billId}`);

      // Mode de chargement basé sur les paramètres disponibles
      if (this.billId) {
        console.log(`Mode: Bill payment for ID ${this.billId}`);
        this.loadBillById(this.billId);
      } else if (this.orderId) {
        console.log(`Mode: Create bill for order ${this.orderId}`);
        this.createBillForOrder(this.orderId);
      } else {
        console.log('Mode: Load unpaid bills or cart');
        this.loadFromCartOrUnpaidBills();
      }
    });
  }

  loadBillById(billId: number): void {
    console.log(`Loading bill by ID: ${billId}`);

    this.api.getBill(billId).subscribe({
      next: (bill) => {
        console.log('✅ Bill loaded successfully:', bill);
        this.setBillData(bill);
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Error loading bill:', err);
        this.handleApiError(err, 'Impossible de charger la facture');
        this.createFallbackBill();
      }
    });
  }

  createBillForOrder(orderId: number): void {
    console.log(`🎯 Creating bill for order: ${orderId}`);

    this.api.initializePayment(orderId).subscribe({
      next: (bill) => {
        console.log('✅ Bill initialized for order:', bill);
        this.setBillData(bill);
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Error initializing payment:', err);

        // Si c'est une erreur 500, on crée une facture de fallback
        if (err.status === 500) {
          console.warn('Server error 500, using fallback bill');
          this.error = 'Le serveur rencontre des difficultés. Utilisation du mode démo.';
          this.createFallbackBill(orderId);
        } else {
          this.handleApiError(err, 'Erreur lors de l\'initialisation du paiement');
        }
      }
    });
  }

  loadFromCartOrUnpaidBills(): void {
    // Essayer d'abord les factures impayées
    this.api.getUnpaidBills().subscribe({
      next: (bills) => {
        console.log('Unpaid bills loaded:', bills);
        if (bills && bills.length > 0) {
          this.setBillData(bills[0]);
        } else {
          // Si pas de factures impayées, vérifier le panier
          const cartItems = this.cartService.getCurrentItems();
          if (cartItems && cartItems.length > 0) {
            console.log('Creating bill from cart items');
            this.createBillFromCart();
          } else {
            this.error = 'Votre panier est vide et aucune facture en attente.';
            this.stopLoading();
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading unpaid bills:', err);
        // En cas d'erreur, essayer avec le panier
        const cartItems = this.cartService.getCurrentItems();
        if (cartItems && cartItems.length > 0) {
          this.createBillFromCart();
        } else {
          this.handleApiError(err, 'Impossible de charger les factures');
          this.createTestBillForDemo();
        }
      }
    });
  }

  createBillFromCart(): void {
    console.log('Creating bill from cart...');
    const cartItems = this.cartService.getCurrentItems();
    const currentUser = this.authService.getCurrentUser();

    // Calculer le total du panier
    const cartTotal = cartItems.reduce((sum: number, item: CartItem) =>
      sum + (item.price * item.quantity), 0);

    // Créer une facture temporaire
    this.createFallbackBillFromCart(cartItems, cartTotal, currentUser?.id || 1);
  }

  createFallbackBillFromCart(items: CartItem[], total: number, customerId: number): void {
    const billId = Date.now(); // ID temporaire
    const vatAmount = total * 0.20;

    // Utiliser une intersection type pour ajouter la propriété custom
    const fallbackBill: MonthlyBill & { isCartBased?: boolean } = {
      id: billId,
      billDate: new Date().toISOString(),
      totalAmount: total + vatAmount,
      status: 'UNPAID',
      customer: {
        id: customerId,
        firstName: this.authService.getCurrentUser()?.firstName || 'Client',
        lastName: this.authService.getCurrentUser()?.lastName || 'Panier',
        email: this.authService.getCurrentUser()?.email || ''
      },
      items: items.map((item: CartItem, index: number) => ({
        id: index + 1,
        description: item.productName || `Produit ${index + 1}`,
        quantity: item.quantity || 1,
        unitPrice: item.price || 0,
        lineTotal: (item.price || 0) * (item.quantity || 1)
      })),
      referenceNumber: `CART-${billId}`,
      taxAmount: vatAmount,
      shippingAmount: 0,
      amountPaid: 0,
      isCartBased: true
    };

    this.setBillData(fallbackBill as MonthlyBill);
  }

  private setBillData(bill: MonthlyBill): void {
    this.ngZone.run(() => {
      console.log('🏃‍♂️ Setting bill data:', bill);

      this.billToPay = bill;
      this.billId = bill.id;
      this.billForSummary = { ...bill }; // Copie pour le résumé

      // Pré-remplir les informations client si disponibles
      if (bill.customer) {
        this.address.fullName = `${bill.customer.firstName || ''} ${bill.customer.lastName || ''}`.trim();
      }

      this.calculateTotals();

      // Arrêter le loading avec un léger délai pour éviter les flickers
      setTimeout(() => {
        this.stopLoading();
        console.log('✅ Bill data set successfully');
      }, 100);
    });
  }

  createTestBillForDemo(): void {
    console.log('Creating test bill for demo...');
    this.creatingTestBill = true;
    this.createBillError = false;

    const currentUser = this.authService.getCurrentUser();
    const customerId = currentUser?.id || 1;

    this.api.createTestBill(customerId).subscribe({
      next: (bill) => {
        console.log('Test bill created:', bill);
        this.creatingTestBill = false;
        this.setBillData(bill);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error creating test bill:', err);
        this.creatingTestBill = false;
        this.createBillError = true;
        this.handleApiError(err, 'Erreur création facture de test');
        this.createFallbackBill();
      }
    });
  }

  createFallbackBill(orderId?: number): void {
    console.log('Creating fallback bill...');

    this.ngZone.run(() => {
      const id = orderId || Math.floor(Math.random() * 1000) + 1000;
      const totalAmount = 32.00;
      const vatAmount = totalAmount * 0.20;
      const currentUser = this.authService.getCurrentUser();

      // Utiliser une intersection type
      const fallbackBill: MonthlyBill & { isFallback?: boolean } = {
        id: id,
        billDate: new Date().toISOString(),
        totalAmount: totalAmount + vatAmount,
        status: 'UNPAID',
        customer: {
          id: currentUser?.id || 3,
          firstName: currentUser?.firstName || 'John',
          lastName: currentUser?.lastName || 'Doe',
          email: currentUser?.email || 'client@example.com'
        },
        items: [
          {
            id: 1,
            description: 'Produit de démonstration',
            quantity: 1,
            unitPrice: totalAmount,
            lineTotal: totalAmount
          }
        ],
        referenceNumber: `BILL-FALLBACK-${id}`,
        taxAmount: vatAmount,
        shippingAmount: 0,
        amountPaid: 0,
        isFallback: true // Marqueur pour facture de secours
      };

      this.billToPay = fallbackBill as MonthlyBill;
      this.billForSummary = { ...this.billToPay };
      this.billId = this.billToPay.id;
      this.calculateTotals();

      setTimeout(() => {
        this.stopLoading();
        console.log('Fallback bill created');
      }, 100);
    });
  }

  calculateTotals(): void {
    if (!this.billToPay) {
      console.warn('No bill to calculate totals');
      return;
    }

    // Calculer le sous-total à partir des items
    if (this.billToPay.items && this.billToPay.items.length > 0) {
      this.subtotal = this.billToPay.items.reduce((sum: number, item) => {
        return sum + (this.toNumber(item.lineTotal) || 0);
      }, 0);
    } else {
      // Fallback sur totalAmount si pas d'items
      this.subtotal = this.toNumber(this.billToPay.totalAmount) || 0;
    }

    // Appliquer la TVA et les frais de livraison
    this.vat = +(this.subtotal * 0.20).toFixed(2);
    this.total = +(this.subtotal + this.vat + this.shipping.price).toFixed(2);

    console.log(`Calculated: subtotal=${this.subtotal}, vat=${this.vat}, total=${this.total}`);
  }

  // Gestion centralisée des erreurs API
  private handleApiError(err: HttpErrorResponse, defaultMessage: string): void {
    console.error('API Error details:', {
      status: err.status,
      statusText: err.statusText,
      message: err.message,
      error: err.error
    });

    let errorMessage = defaultMessage;

    if (err.status === 0) {
      errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
    } else if (err.status === 404) {
      errorMessage = 'Ressource non trouvée.';
    } else if (err.status === 500) {
      errorMessage = 'Erreur serveur interne. Veuillez réessayer plus tard.';
    } else if (err.error?.message) {
      errorMessage = err.error.message;
    }

    this.ngZone.run(() => {
      this.error = errorMessage;
      this.stopLoading();
      this.cdr.detectChanges();
    });
  }

  // Arrêter proprement le loading
  private stopLoading(): void {
    this.loading = false;
    this.isPaying = false;
    this.creatingTestBill = false;
    this.downloadingPdf = false;

    // Forcer la détection de changement
    this.cdr.detectChanges();
  }

  // VALIDATIONS

  validAddress(): boolean {
    const valid = !!this.address.fullName?.trim() &&
                  !!this.address.phone?.trim() &&
                  !!this.address.line1?.trim() &&
                  !!this.address.city?.trim() &&
                  !!this.address.zip?.trim();
    console.log(`Address valid: ${valid}`, this.address);
    return valid;
  }

  selectShipping(method: 'Standard' | 'Express'): void {
    console.log(`Shipping method selected: ${method}`);
    this.shipping.method = method;
    this.shipping.price = method === 'Express' ? 9.90 : 0;
    this.shipping.eta = method === 'Express' ? '24-48h' : '3-5 jours';
    this.recalc();
  }

  recalc(): void {
    this.vat = +(this.subtotal * 0.20).toFixed(2);
    this.total = +(this.subtotal + this.vat + this.shipping.price).toFixed(2);
    console.log(`Recalculated total: ${this.total}`);
  }

  validPayment(): boolean {
    let valid = false;

    switch (this.payment.method) {
      case 'CARD':
        valid = this.payment.cardName.trim().length > 2
          && this.payment.cardNumber.replace(/\s/g, '').length >= 12
          && this.payment.exp.trim().length >= 4
          && this.payment.cvv.trim().length >= 3;
        break;
      case 'PAYPAL':
        valid = this.payment.paypalEmail.includes('@') &&
                this.payment.paypalEmail.includes('.');
        break;
      case 'BANK_TRANSFER':
        valid = this.payment.iban.trim().length >= 12;
        break;
      default: // CASH
        valid = true;
    }

    console.log(`Payment valid: ${valid}`, this.payment.method);
    return valid;
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }

    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }

    this.payment.cardNumber = parts.join(' ');
  }

  // NAVIGATION ENTRE ÉTAPES

  next(): void {
    console.log(`Current step: ${this.step}, moving to next step`);

    if (this.step === 1) {
      if (this.validAddress()) {
        this.step = 2;
        console.log('Moving to step 2: Shipping');
      } else {
        this.error = 'Veuillez remplir toutes les informations d\'adresse.';
      }
    } else if (this.step === 2) {
      this.step = 3;
      console.log('Moving to step 3: Payment');
    }

    this.error = ''; // Clear error on successful step change
  }

  prev(): void {
    console.log(`Current step: ${this.step}, moving to previous step`);
    if (this.step === 3) {
      this.step = 2;
    } else if (this.step === 2) {
      this.step = 1;
    }
    this.error = '';
  }

  // CONFIRMATION DE PAIEMENT

  confirm(): void {
    if (!this.billToPay || !this.billId) {
      this.error = 'Facture non disponible pour le paiement.';
      console.error('Cannot confirm: billToPay or billId is null');
      return;
    }

    if (!this.termsAccepted) {
      this.error = 'Veuillez accepter les conditions générales.';
      return;
    }

    console.log(`Confirming payment for bill ${this.billId}, amount: ${this.total}, method: ${this.payment.method}`);

    this.isPaying = true;
    this.payError = false;
    this.error = '';

    // Simuler un délai de traitement
    setTimeout(() => {
      this.processPayment();
    }, 500);
  }

  private processPayment(): void {
    this.api.payBill(this.billId!, this.total, this.payment.method).subscribe({
      next: (payment) => {
        console.log('Payment successful:', payment);
        this.isPaying = false;

        // Vider le panier
        this.cartService.clear();

        // Rediriger vers la confirmation
        this.router.navigate(['/confirmation', this.billId], {
          queryParams: {
            success: 'true',
            amount: this.total,
            method: this.payment.method
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Payment failed:', err);
        this.isPaying = false;
        this.payError = true;

        if (err.status === 500) {
          // En cas d'erreur 500, simuler un succès pour la démo
          console.warn('Server error 500, simulating success for demo');
          this.simulateSuccessfulPayment();
        } else {
          this.error = 'Le paiement a échoué. Veuillez réessayer ou utiliser un autre moyen de paiement.';
        }
      }
    });
  }

  private simulateSuccessfulPayment(): void {
    // Simuler un paiement réussi pour la démo
    setTimeout(() => {
      console.log('Simulating successful payment for demo...');
      this.cartService.clear();
      this.router.navigate(['/confirmation', this.billId], {
        queryParams: {
          success: 'true',
          demo: 'true',
          amount: this.total
        }
      });
    }, 1000);
  }

  // TÉLÉCHARGEMENT PDF

  downloadPdf(): void {
    if (!this.billForSummary) {
      this.error = 'Aucune facture disponible pour le téléchargement.';
      console.error('Cannot download PDF: no bill');
      return;
    }

    console.log(`Downloading PDF for bill ${this.billForSummary.id}`);
    this.downloadingPdf = true;
    this.pdfError = false;

    this.api.downloadBillPdf(this.billForSummary.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${this.billForSummary?.id}-${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.downloadingPdf = false;
        console.log('PDF downloaded successfully');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error downloading PDF:', err);
        this.downloadingPdf = false;
        this.pdfError = true;

        // Offrir une alternative
        if (confirm('Le téléchargement a échoué. Souhaitez-vous générer un reçu local ?')) {
          this.generateLocalReceipt();
        }
      }
    });
  }

  private generateLocalReceipt(): void {
    const receiptContent = `
      RECU DE PAIEMENT
      ================
      Facture: ${this.billForSummary?.referenceNumber || this.billForSummary?.id}
      Date: ${new Date().toLocaleDateString()}
      Client: ${this.getCustomerFullName()}
      Montant: ${this.total} €
      Statut: PAYE

      Merci pour votre achat !
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recu-${this.billForSummary?.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // AUTRES ACTIONS

  backToCatalog(): void {
    console.log('Going back to catalog');
    this.router.navigate(['/catalog']);
  }

  resetCheckout(): void {
    console.log('Resetting checkout form');
    this.step = 1;
    this.loading = false;
    this.error = '';
    this.isPaying = false;
    this.payError = false;
    this.termsAccepted = false;

    // Réinitialiser les formulaires
    this.address = { fullName: '', phone: '', line1: '', city: '', zip: '' };
    this.payment = {
      method: 'CARD',
      cardName: '',
      cardNumber: '',
      exp: '',
      cvv: '',
      paypalEmail: '',
      iban: ''
    };

    this.cdr.detectChanges();
  }

  // MÉTHODES DE DEBUG

  getDebugInfo(): string {
    return `
      Loading: ${this.loading}
      Step: ${this.step}
      Bill ID: ${this.billId}
      Order ID: ${this.orderId}
      Bill exists: ${!!this.billToPay}
      Total: ${this.total}
    `;
  }

  forceStopLoading(): void {
    console.warn(' MANUALLY stopping loading');
    this.ngZone.run(() => {
      this.stopLoading();
    });
  }
}
