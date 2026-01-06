import { Injectable } from '@angular/core';
import { Address, CartItem, Invoice, Order, Payment, PaymentMethod, PaymentMethodType } from './models';

@Injectable({ providedIn: 'root' })
export class FakeApi {
  private addressId = 2;
  private pmId = 2;
  private orderId = 1201;
  private paymentId = 9001;
  private invoiceId = 5001;

  // DB fake
  addresses: Address[] = [
    { id: 1, fullName: 'Test Test', line1: '12 Rue Exemple', city: 'Paris', zip: '75001', country: 'FR' },
  ];

  paymentMethods: PaymentMethod[] = [
    { id: 1, type: 'CARD', token: 'tok_xxx_visa', brand: 'VISA', last4: '4242', expMonth: 12, expYear: 2028, isDefault: true },
  ];

  cart: CartItem[] = [
    { id: 1, title: 'PC Gamer', qty: 2, unitPrice: 1500 },
  ];

  orders: Order[] = [];
  payments: Payment[] = [];
  invoices: Invoice[] = [];

  getCart(): CartItem[] { return this.cart; }

  getAddresses(): Address[] { return this.addresses; }
  addAddress(a: Omit<Address,'id'>): Address {
    const created: Address = { id: this.addressId++, ...a };
    this.addresses = [created, ...this.addresses];
    return created;
  }

  getPaymentMethods(): PaymentMethod[] { return this.paymentMethods; }
  addCard(card: { brand: string; last4: string; expMonth: number; expYear: number }): PaymentMethod {
    const created: PaymentMethod = {
      id: this.pmId++,
      type: 'CARD',
      token: 'tok_sim_' + Math.random().toString(16).slice(2),
      brand: card.brand,
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
      isDefault: this.paymentMethods.length === 0,
    };
    this.paymentMethods = [created, ...this.paymentMethods];
    if (created.isDefault) this.setDefaultPaymentMethod(created.id);
    return created;
  }
  removePaymentMethod(id: number){
    this.paymentMethods = this.paymentMethods.filter(p => p.id !== id);
    if (!this.paymentMethods.some(p => p.isDefault) && this.paymentMethods[0]) {
      this.paymentMethods[0].isDefault = true;
    }
  }
  setDefaultPaymentMethod(id: number){
    this.paymentMethods = this.paymentMethods.map(p => ({...p, isDefault: p.id === id}));
  }

  createOrder(shippingMethod: 'STANDARD' | 'EXPRESS'): Order {
    const subtotal = this.cart.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const vatRate = 0.20;
    const shippingPrice = shippingMethod === 'EXPRESS' ? 19.99 : 6.99;
    const vatAmount = +(subtotal * vatRate).toFixed(2);
    const total = +(subtotal + vatAmount + shippingPrice).toFixed(2);

    const order: Order = {
      id: this.orderId++,
      status: 'PENDING_PAYMENT',
      createdAt: new Date().toISOString(),
      items: this.cart.map(x => ({...x})),
      shippingMethod,
      shippingPrice,
      vatRate,
      subtotal,
      vatAmount,
      total,
    };
    this.orders = [order, ...this.orders];
    return order;
  }

  payOrder(orderId: number, method: PaymentMethodType, amount: number): Payment {
    // Simu “réaliste”
    const shouldFail = method === 'CARD' && Math.random() < 0.18; // 18% fail
    const payment: Payment = {
      id: this.paymentId++,
      orderId,
      method,
      amount,
      status: shouldFail ? 'FAILED' : 'SUCCESS',
      providerRef: 'prov_' + Math.random().toString(16).slice(2),
      paidAt: shouldFail ? undefined : new Date().toISOString(),
      failReason: shouldFail ? 'Paiement refusé (banque / 3D Secure)' : undefined,
    };
    this.payments = [payment, ...this.payments];

    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = payment.status === 'SUCCESS' ? 'CONFIRMED' : 'PENDING_PAYMENT';
    }

    // facture si succès
    if (payment.status === 'SUCCESS') {
      const inv: Invoice = {
        id: this.invoiceId++,
        orderId,
        number: `FAC-2025-${String(this.invoiceId).padStart(6,'0')}`,
        status: 'PAID',
        issuedAt: new Date().toISOString(),
        paidAt: payment.paidAt,
        total: amount,
      };
      this.invoices = [inv, ...this.invoices];
    }

    return payment;
  }

  getOrders(): Order[] { return this.orders; }
  getOrder(id:number): Order | undefined { return this.orders.find(o => o.id === id); }

  getPaymentsForOrder(orderId:number): Payment[] { return this.payments.filter(p => p.orderId === orderId); }

  getInvoices(): Invoice[] { return this.invoices; }
  getInvoiceByOrder(orderId:number): Invoice | undefined { return this.invoices.find(i => i.orderId === orderId); }
}
