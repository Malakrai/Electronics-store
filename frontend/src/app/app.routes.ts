import { Routes } from '@angular/router';
import { BillingComponent } from './pages/billing/billing';

export const routes: Routes = [
  { path: '', redirectTo: 'billing', pathMatch: 'full' },
  { path: 'billing', component: BillingComponent },
  { path: '**', redirectTo: 'billing' }
];
