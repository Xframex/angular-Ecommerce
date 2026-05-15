import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { from, lastValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {

  

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }
  // Method to intercept HTTP requests and add authentication headers 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req, next));
  }
  // Methode to handle access and add authentication headers 
  async handleAccess(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    // add authorization header only for secured endpoints 
    const theEndpoint = environment.IsmaCartshopApiUrl + '/orders';
    const securedEndpoints = [theEndpoint];
    
    if(securedEndpoints.some(url => req.urlWithParams.includes(url))) {
      // get access token from okta
      const accessToken = this.oktaAuth.getAccessToken();
      // clone request and add new header with access token and send it
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }
      })
    }
    return await lastValueFrom(next.handle(req));

    }
  
}
