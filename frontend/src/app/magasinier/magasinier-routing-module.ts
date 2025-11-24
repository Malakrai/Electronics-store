import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsCrud } from './pages/products-crud/products-crud';

const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductsCrud }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MagasinierRoutingModule { }
