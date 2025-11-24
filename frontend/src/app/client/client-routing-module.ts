import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Catalog } from './pages/catalog/catalog';
import { Search } from './pages/search/search';
import { ProductDetails } from './pages/product-details/product-details';

const routes: Routes = [
  { path: '', redirectTo: 'catalog', pathMatch: 'full' },
  { path: 'catalog', component: Catalog },
  { path: 'search', component: Search },
  { path: 'product/:id', component: ProductDetails}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
