import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BillingService,
  MonthlyBill,
  PaymentMethod,
  BillStatus
} from '../../services/billing';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css'
})
export class BillingComponent implements OnInit {
  bills: MonthlyBill[] = [];
  selectedBill?: MonthlyBill;

  isLoading = false;
  isPaying = false;
  errorMessage = '';
  successMessage = '';

  paymentMethod: PaymentMethod = 'CARD';
  paymentAmount?: number;

  constructor(private billingService: BillingService) {}

  ngOnInit(): void {
    this.loadUnpaidBills();
  }

  loadUnpaidBills(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // On charge toutes les factures (tu peux remettre getUnpaidBills si tu veux)
    this.billingService.getAllBills().subscribe({
      next: (bills) => {
        this.bills = bills;
        this.isLoading = false;
        if (bills.length > 0) {
          this.selectBill(bills[0]);
        } else {
          this.selectedBill = undefined;
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors du chargement des factures.';
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
      return;
    }

    const amount = this.paymentAmount ?? this.selectedBill.totalAmount;
    if (amount <= 0) {
      this.errorMessage = 'Le montant doit être supérieur à 0.';
      this.successMessage = '';
      return;
    }

    this.isPaying = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.billingService.payBill(this.selectedBill.id, amount, this.paymentMethod).subscribe({
      next: (payment) => {
        this.isPaying = false;
        this.successMessage = `Paiement de ${payment.amount.toFixed(
          2
        )} € effectué avec succès en ${payment.method}.`;
        this.loadUnpaidBills();
      },
      error: (err) => {
        console.error(err);
        this.isPaying = false;
        this.errorMessage = 'Erreur lors du paiement de la facture.';
      }
    });
  }

  getStatusChipClass(status: BillStatus): string {
    switch (status) {
      case 'PAID':
        return 'chip chip-paid';
      case 'CANCELLED':
        return 'chip chip-cancelled';
      default:
        return 'chip chip-unpaid';
    }
  }

  openPdf(bill: MonthlyBill): void {
    // À remplacer par ton vrai endpoint PDF plus tard si tu en crées un
    window.print();
  }
}
