import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersAdmin } from './pages/users-crud/users-crud';

const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', component: UsersAdmin }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
