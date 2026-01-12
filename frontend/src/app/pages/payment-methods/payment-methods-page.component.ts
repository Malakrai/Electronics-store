import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface PaymentMethod {
  id: number;
  type: 'CARD' | 'PAYPAL' | 'BANK_TRANSFER';
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-payment-methods-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payment-methods-page.component.html',
  styleUrls: ['./payment-methods-page.component.css']
})
export class PaymentMethodsPageComponent implements OnInit {
  paymentMethods: PaymentMethod[] = [];
  showAddForm = false;

  // Form fields
  newMethod: Partial<PaymentMethod> = {
    type: 'CARD',
    brand: 'VISA',
    last4: '',
    expMonth: 12,
    expYear: new Date().getFullYear() + 2,
    isDefault: false
  };

  loading = false;
  error = '';

  constructor() {}

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.paymentMethods = [
        {
          id: 1,
          type: 'CARD',
          brand: 'VISA',
          last4: '4242',
          expMonth: 12,
          expYear: 2025,
          isDefault: true,
          createdAt: new Date('2024-01-15')
        },
        {
          id: 2,
          type: 'CARD',
          brand: 'MASTERCARD',
          last4: '8888',
          expMonth: 6,
          expYear: 2026,
          isDefault: false,
          createdAt: new Date('2024-03-20')
        },
        {
          id: 3,
          type: 'PAYPAL',
          isDefault: false,
          createdAt: new Date('2024-02-10')
        }
      ];
      this.loading = false;
    }, 500);
  }

  getTypeLabel(type: string): string {
    switch(type) {
      case 'CARD': return 'Carte bancaire';
      case 'PAYPAL': return 'PayPal';
      case 'BANK_TRANSFER': return 'Virement bancaire';
      default: return type;
    }
  }

  getBrandIcon(brand?: string): string {
    switch(brand) {
      case 'VISA': return '💳';
      case 'MASTERCARD': return '💳';
      case 'PAYPAL': return '🌐';
      default: return '💳';
    }
  }

  addPaymentMethod(): void {
    if (!this.validateForm()) {
      return;
    }

    const newId = Math.max(...this.paymentMethods.map(p => p.id), 0) + 1;
    const method: PaymentMethod = {
      id: newId,
      type: this.newMethod.type || 'CARD',
      brand: this.newMethod.brand,
      last4: this.newMethod.last4,
      expMonth: this.newMethod.expMonth,
      expYear: this.newMethod.expYear,
      isDefault: this.newMethod.isDefault || false,
      createdAt: new Date()
    };

    // If setting as default, unset others
    if (method.isDefault) {
      this.paymentMethods.forEach(p => p.isDefault = false);
    }

    this.paymentMethods.push(method);
    this.resetForm();
    this.showAddForm = false;
  }

  validateForm(): boolean {
    if (this.newMethod.type === 'CARD') {
      if (!this.newMethod.last4 || this.newMethod.last4.length !== 4) {
        this.error = 'Les 4 derniers chiffres de la carte doivent être renseignés';
        return false;
      }
      if (!this.newMethod.brand) {
        this.error = 'La marque de la carte est requise';
        return false;
      }
      if (!this.newMethod.expMonth || !this.newMethod.expYear) {
        this.error = 'La date d\'expiration est requise';
        return false;
      }
    }
    this.error = '';
    return true;
  }

  resetForm(): void {
    this.newMethod = {
      type: 'CARD',
      brand: 'VISA',
      last4: '',
      expMonth: 12,
      expYear: new Date().getFullYear() + 2,
      isDefault: false
    };
    this.error = '';
  }

  setDefaultMethod(id: number): void {
    this.paymentMethods.forEach(method => {
      method.isDefault = method.id === id;
    });
  }

  removeMethod(id: number): void {
    const method = this.paymentMethods.find(m => m.id === id);
    if (method?.isDefault) {
      alert('Vous ne pouvez pas supprimer votre méthode de paiement par défaut');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?')) {
      this.paymentMethods = this.paymentMethods.filter(m => m.id !== id);
    }
  }

  getExpirationDate(month?: number, year?: number): string {
    if (!month || !year) return 'Non spécifié';
    return `${month.toString().padStart(2, '0')}/${year}`;
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  getFutureYears(yearsAhead: number): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: yearsAhead }, (_, i) => currentYear + i);
  }
}
