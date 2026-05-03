import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../common/purchase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {

  private purchaseUrl = 'http://localhost:8080/api/checkout/purchase';

  constructor(private http: HttpClient) { }
  
  // Method to place an order by sending the purchase data to the backend API
  placeOrder(purchase: Purchase): Observable<any> {
    return this.http.post(this.purchaseUrl, purchase);
  }
}
