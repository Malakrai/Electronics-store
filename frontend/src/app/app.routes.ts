import { Routes } from '@angular/router';
import { CheckoutPageComponent } from './pages/checkout/checkout-page.component';
import { ConfirmationPageComponent } from './pages/confirmation/confirmation-page.component';
import { OrdersPageComponent } from './pages/orders/orders-page.component';
import { InvoicesPageComponent } from './pages/invoices/invoices-page.component';
import { InvoiceViewPageComponent } from './pages/invoice-view/invoice-view-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'checkout' },

  // ✅ checkout sans orderId (mode test)
  { path: 'checkout', component: CheckoutPageComponent },

  // ✅ checkout avec orderId (mode merge réel)
  { path: 'checkout/:orderId', component: CheckoutPageComponent },

  { path: 'confirmation/:billId', component: ConfirmationPageComponent },

  { path: 'orders', component: OrdersPageComponent },
  { path: 'invoices', component: InvoicesPageComponent },
  { path: 'invoices/:billId', component: InvoiceViewPageComponent },

  { path: '**', redirectTo: 'checkout' },
];
