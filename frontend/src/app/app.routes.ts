import { Routes } from '@angular/router';
import { StatisticsComponent } from './statistics/statistics.component';

export const appRoutes: Routes = [
  { path: '', component: StatisticsComponent },
  { path: '**', redirectTo: '' }
];
