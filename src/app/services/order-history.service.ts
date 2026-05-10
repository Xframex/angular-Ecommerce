import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderHistory {

  // base url
  private orderUrl = 'http://localhost:8080/api/orders';

  constructor(private httpClient: HttpClient) { }
  
  getOrderHistory(theEmail: string): Observable<GetResponseOrderHistory> {
    // build URL based on customer email
    const searchUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${theEmail}`;
    return this.httpClient.get<GetResponseOrderHistory>(searchUrl);
  }
  
}
// define interfaces to hold JSON response from backend for order historyorder
interface GetResponseOrderHistory {
  _embedded: {
    orders: OrderHistory[];
  }
}
