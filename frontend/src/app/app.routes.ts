import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  /* =====================
     REDIRECTION PAR DÉFAUT
  ====================== */
  {
    path: '',
    redirectTo: '/catalog',
    pathMatch: 'full'
  },

  /* =====================
     AUTH
  ====================== */
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register/register')
        .then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password')
        .then(m => m.ForgotPasswordComponent)
  },

  /* =====================
     ROUTES PUBLIQUES (CUSTOMER)
  ====================== */
  {
    path: 'catalog',
    loadComponent: () =>
      import('./components/customer/catalog/catalog')
        .then(m => m.Catalog)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./components/customer/cart/cart')
        .then(m => m.CartComponent)
  },

  /* =====================
     CHECKOUT & FACTURATION
  ====================== */
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout-page.component')
        .then(m => m.CheckoutPageComponent)
  },
  {
    path: 'checkout/:orderId',
    loadComponent: () =>
      import('./pages/checkout/checkout-page.component')
        .then(m => m.CheckoutPageComponent)
  },
  {
    path: 'confirmation/:billId',
    loadComponent: () =>
      import('./pages/confirmation/confirmation-page.component')
        .then(m => m.ConfirmationPageComponent)
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders/orders-page.component')
        .then(m => m.OrdersPageComponent)
  },
  {
    path: 'orders/:orderId',
    loadComponent: () =>
      import('./pages/order-details/order-details-page.component')
        .then(m => m.OrderDetailsPageComponent)
  },

  {
    path: 'invoices',
    loadComponent: () =>
      import('./pages/invoices/invoices-page.component')
        .then(m => m.InvoicesPageComponent)
  },
  {
    path: 'invoice/:id',
    loadComponent: () =>
      import('./pages/invoice-view/invoice-view-page.component')
        .then(m => m.InvoiceViewPageComponent)
  },

  /* =====================
     CUSTOMER (LOGIN OBLIGATOIRE)
  ====================== */
  {
    path: 'customer/profile',
    loadComponent: () =>
      import('./components/customer/customer-profile/customer-profile')
        .then(m => m.CustomerProfileComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CUSTOMER'] }
  },
  {
    path: 'customer/delivery',
    loadComponent: () =>
      import('./components/customer/delivery/delivery.component')
        .then(m => m.DeliveryComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CUSTOMER'] }
  },
  /* =====================
     ADMIN
  ====================== */
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./components/admin/admin-dashboard/admin-dashboard')
        .then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./components/admin/users-crud/users-crud')
        .then(m => m.UsersAdmin),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'admin/statistics',
    loadComponent: () =>
      import('./components/admin/statistics/statistics.component')
        .then(m => m.StatisticsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  /* =====================
     MAGASINIER
  ====================== */
  {
    path: 'magasinier/dashboard',
    loadComponent: () =>
      import('./components/magasinier/magasinier-dashboard/magasinier-dashboard')
        .then(m => m.MagasinierDashboard),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['MAGASINIER'] }
  },
  {
    path: 'magasinier/products',
    loadComponent: () =>
      import('./components/magasinier/products-crud/products-crud')
        .then(m => m.ProductsCrud),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['MAGASINIER'] }
  },
  {
    path: 'magasinier/commandes',
    loadComponent: () =>
      import('./components/magasinier/magasinier-orders/magasinier-orders')
        .then(m => m.MagasinierOrders),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['MAGASINIER'] }
  },

  /* =====================
     404
  ====================== */
  {
    path: '**',
    redirectTo: '/catalog'
  }
];
