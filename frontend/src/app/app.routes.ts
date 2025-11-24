/*import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/catalog', pathMatch: 'full' },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule)
  },
  { 
    path: 'magasinier', 
    loadChildren: () => import('./magasinier/magasinier-module').then(m => m.MagasinierModule)
  },
  { 
    path: 'client', 
    loadChildren: () => import('./client/client-module').then(m => m.ClientModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 
*/
/*
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app.component').then(m => m.App)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  }
];
*/

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/catalog', pathMatch: 'full' },
  
  // ✅ Routes Admin
  { 
    path: 'admin/users', 
    loadComponent: () => import('./admin/pages/users-crud/users-crud').then(c => c.UsersAdmin)
  },
  
  // ✅ Routes Client
  { 
    path: 'catalog', 
    loadComponent: () => import('./client/pages/catalog/catalog').then(c => c.Catalog)
  },
  { 
    path: 'search', 
    loadComponent: () => import('./client/pages/search/search').then(c => c.Search)
  },
  { 
    path: 'product/:id', 
    loadComponent: () => import('./client/pages/product-details/product-details').then(c => c.ProductDetails)
  },
  
  // ✅ Routes Magasinier
  { 
    path: 'magasinier/products', 
    loadComponent: () => import('./magasinier/pages/products-crud/products-crud').then(c => c.ProductsCrud)
  },
  
  // ✅ Route 404
  { path: '**', redirectTo: '/catalog' }
];