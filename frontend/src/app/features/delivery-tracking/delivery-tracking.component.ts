import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delivery-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './delivery-tracking.component.html',
  styleUrls: ['./delivery-tracking.component.scss'],
})
export class DeliveryTrackingComponent {
  trackingNumber = '';
  deliveryInfo: any = null;

  checkTracking() {
    // version SANS backend → juste pour éviter les erreurs
    this.deliveryInfo = {
      trackingNumber: this.trackingNumber,
      status: 'Mock data OK',
    };
  }
}


