import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/catalog', pathMatch: 'full' },

  // Routes Admin
  { 
    path: 'admin/users', 
    loadComponent: () => import('./admin/pages/users-crud/users-crud').then(c => c.UsersAdmin)
  },

  // Routes Client
  { 
    path: 'catalog', 
    loadComponent: () => import('./client/pages/catalog/catalog').then(c => c.Catalog)
  },
  { 
    path: 'search', 
    loadComponent: () => import('./shared/search/search').then(c => c.SearchShared)
  },
  { 
    path: 'product/:id', 
    loadComponent: () => import('./client/pages/product-details/product-details').then(c => c.ProductDetails) 
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./client/pages/cart/cart').then(c => c.CartComponent)
  },

  { path: 'account', redirectTo: '/catalog', pathMatch: 'full' },


  // Routes Magasinier
  { 
    path: 'magasinier/products', 
    loadComponent: () => import('./magasinier/pages/products-crud/products-crud').then(c => c.ProductsCrud) 
  },

  // Route pour /admin simple
  { 
    path: 'admin', 
    redirectTo: 'admin/users', 
    pathMatch: 'full' 
  },

  // Route 404
  { path: '**', redirectTo: '/catalog' }
];
