import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { ShipmentTrackingService } from '../../services/shipment-tracking.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
  ],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
})
export class OrderTrackingComponent {
  orderNumber = '';
  deliveryInfo: any = null;

  constructor(private shipmentService: ShipmentTrackingService) {}

  trackDelivery() {
    this.shipmentService.track(this.orderNumber).subscribe({
      next: (data) => {
        this.deliveryInfo = data;
      },
      error: () => {
        this.deliveryInfo = null;
        alert('Numéro de suivi introuvable !');
      },
    });
  }
}
