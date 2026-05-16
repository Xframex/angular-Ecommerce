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
  private readonly paymentIntentUrl = environment.IsmaCartshopApiUrl + '/checkout/create-payment-intent';

  constructor(private readonly http: HttpClient) { }
  
  placeOrder(purchase: Purchase): Observable<any> {
    return this.http.post(this.purchaseUrl, purchase);
  }

  createPaymentIntent(amount: number, currency: string): Observable<any> {
    return this.http.post(this.paymentIntentUrl, { amount, currency });
  }
}
