import { Routes } from '@angular/router';

import { OrderTrackingComponent } from './features/order-tracking/order-tracking.component';
import { DeliveryComponent } from './features/delivery/delivery.component';
import { DeliveryTrackingComponent } from './features/delivery-tracking/delivery-tracking.component';
import { ReviewsComponent } from './features/reviews/reviews.component';

export const routes: Routes = [
  { path: 'tracking', component: OrderTrackingComponent },
  { path: 'delivery', component: DeliveryComponent },
  { path: 'delivery-track', component: DeliveryTrackingComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: '**', redirectTo: 'tracking' },
];
