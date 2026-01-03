import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShipmentTrackingService {
  private apiUrl = 'http://localhost:8080/api/delivery-tracking';

  constructor(private http: HttpClient) {}

  track(trackingNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${trackingNumber}`);
  }
}
