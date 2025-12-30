import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./components/auth/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/auth/register/register').then(m => m.RegisterComponent)
    },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
  },
    {
        path: 'admin/dashboard',
        loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN'] }
    },
    {
        path: 'magasinier/dashboard',
        loadComponent: () => import('./components/magasinier/magasinier-dashboard/magasinier-dashboard').then(m => m.MagasinierDashboard),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['MAGASINIER'] }
    },
    {
        path: 'customer/dashboard',
        loadComponent: () => import('./components/customer/customer-dashboard/customer-dashboard').then(m => m.CustomerDashboard),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['CUSTOMER'] }
    },
  {
          path: 'customer/profile',
          loadComponent: () => import('./components/customer/customer-profile/customer-profile').then(m => m.CustomerProfileComponent),
          canActivate: [AuthGuard, RoleGuard],
          data: { roles: ['CUSTOMER'] }
      },

    {
        path: '**',
        redirectTo: '/login'
    }
];
