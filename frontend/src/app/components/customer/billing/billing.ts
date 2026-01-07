import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BillingService, MonthlyBill, PaymentMethod, BillStatus } from '../../../services/billing.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrls: ['./billing.css']
})
export class BillingComponent implements OnInit {
  bills: MonthlyBill[] = [];
  unpaidBills: MonthlyBill[] = [];
  selectedBill?: MonthlyBill;

  isLoading = false;
  isPaying = false;
  errorMessage = '';
  successMessage = '';

  paymentMethod: PaymentMethod = 'CARD';
  paymentAmount?: number;

  newBillsCount = 0;

  constructor(
    private billingService: BillingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllBills();
  }

  loadAllBills(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.billingService.getAllBills().subscribe({
      next: (allBills: MonthlyBill[]) => {
        this.bills = allBills.filter(bill => bill.status !== 'CANCELLED');
        this.unpaidBills = this.bills.filter(bill => bill.status === 'UNPAID');

        this.isLoading = false;

        if (this.unpaidBills.length > 0) {
          this.selectBill(this.unpaidBills[0]);
        } else if (this.bills.length > 0) {
          this.selectBill(this.bills[0]);
        } else {
          this.selectedBill = undefined;
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement factures:', err);
        this.errorMessage = 'Impossible de charger vos factures. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  loadUnpaidBills(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.billingService.getUnpaidBills().subscribe({
      next: (unpaidBills: MonthlyBill[]) => {
        this.unpaidBills = unpaidBills;
        this.bills = unpaidBills;

        this.isLoading = false;

        if (unpaidBills.length > 0) {
          this.selectBill(unpaidBills[0]);
        } else {
          this.selectedBill = undefined;
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement factures impayées:', err);
        this.errorMessage = 'Erreur lors du chargement des factures impayées.';
        this.isLoading = false;
      }
    });
  }

  selectBill(bill: MonthlyBill): void {
    this.selectedBill = bill;
    this.successMessage = '';
    this.errorMessage = '';
    this.paymentAmount = bill.totalAmount;
  }

  onBillChange(value: string): void {
    const id = Number(value);
    const bill = this.bills.find((b) => b.id === id);
    if (bill) {
      this.selectBill(bill);
    }
  }

  paySelectedBill(): void {
    if (!this.selectedBill) {
      this.errorMessage = 'Aucune facture sélectionnée.';
      return;
    }

    if (this.selectedBill.status === 'PAID') {
      this.errorMessage = 'Cette facture a déjà été payée.';
      return;
    }

    if (this.selectedBill.status === 'CANCELLED') {
      this.errorMessage = 'Cette facture a été annulée.';
      return;
    }

    const amount = this.paymentAmount ?? this.selectedBill.totalAmount;

    if (amount <= 0) {
      this.errorMessage = 'Le montant doit être supérieur à 0.';
      return;
    }

    if (amount > this.selectedBill.totalAmount) {
      this.errorMessage = `Le montant ne peut pas dépasser ${this.selectedBill.totalAmount} €`;
      return;
    }

    this.isPaying = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.billingService.payBill(this.selectedBill.id, amount, this.paymentMethod).subscribe({
      next: (payment: any) => {
        this.isPaying = false;
        this.successMessage = ` Paiement de ${payment.amount.toFixed(2)} € effectué avec succès !`;

        setTimeout(() => {
          this.loadAllBills();
        }, 1500);
      },
      error: (err: any) => {
        console.error('Erreur paiement:', err);
        this.isPaying = false;

        if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Données de paiement invalides.';
        } else if (err.status === 404) {
          this.errorMessage = 'Facture introuvable.';
        } else if (err.status === 409) {
          this.errorMessage = 'Cette facture a déjà été payée.';
        } else if (err.status === 402) {
          this.errorMessage = 'Paiement refusé. Vérifiez vos informations de paiement.';
        } else {
          this.errorMessage = 'Erreur lors du paiement. Veuillez réessayer.';
        }
      }
    });
  }

  // NOUVELLE MÉTHODE POUR OBTENIR LE NOMBRE DE FACTURES IMPAYÉES
  getUnpaidCount(): number {
    return this.unpaidBills.length;
  }

  getMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case 'CARD': return 'carte bancaire';
      case 'PAYPAL': return 'PayPal';
      case 'BANK_TRANSFER': return 'virement bancaire';
      case 'CASH': return 'espèces';
      default: return method;
    }
  }

  getStatusChipClass(status: BillStatus): string {
    switch (status) {
      case 'PAID':
        return 'chip chip-paid';
      case 'CANCELLED':
        return 'chip chip-cancelled';
      case 'UNPAID':
      default:
        return 'chip chip-unpaid';
    }
  }

  getStatusLabel(status: BillStatus): string {
    switch (status) {
      case 'PAID': return 'PAYÉE';
      case 'CANCELLED': return 'ANNULÉE';
      case 'UNPAID': return 'IMPAYÉE';
      default: return status;
    }
  }

  openPdf(bill: MonthlyBill): void {
    const pdfUrl = `http://localhost:8080/api/bills/${bill.id}/pdf`;
    window.open(pdfUrl, '_blank');
  }

  reloadBills(): void {
    this.bills = [];
    this.unpaidBills = [];
    this.selectedBill = undefined;
    this.newBillsCount = 0;
    this.loadAllBills();
  }

  goToOrders(): void {
    this.router.navigate(['/customer/orders']);
  }

  goToCart(): void {
    this.router.navigate(['/customer/cart']);
  }

  goToShop(): void {
    this.router.navigate(['/shop']);
  }
}
