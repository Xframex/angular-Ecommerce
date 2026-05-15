import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../common/purchase';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {


  private readonly purchaseUrl = environment.IsmaCartshopApiUrl + '/checkout/purchase';

  constructor(private readonly http: HttpClient) { }
  
  // Method to place an order by sending the purchase data to the backend API
  placeOrder(purchase: Purchase): Observable<any> {
    return this.http.post(this.purchaseUrl, purchase);
  }
}
