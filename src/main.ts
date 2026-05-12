/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Routes, provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';

// Components
import { ProductList } from './app/components/product-list/product-list';
import { ProductDetails } from './app/components/product-details/product-details';
import { CartDetails } from './app/components/cart-details/cart-details';
import { Checkout } from './app/components/checkout/checkout';
import { Login } from './app/components/login/login'; 
import { AuthInterceptorService } from './app/services/auth-interceptor.service';

// Modules
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

// Okta
import { OktaCallbackComponent, OKTA_CONFIG, OktaAuthModule, OktaAuthGuard } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import myAppconfig from './app/config/my-app-config';
import { MembersPage } from './app/components/members-page/members-page';
import { OrderHistoryComponent } from './app/components/order-history/order-history';

// Okta config
const oktaAuth = new OktaAuth(myAppconfig.oidc);

// Routes
const routes: Routes = [
  { path: 'login/callback', component: OktaCallbackComponent },
  { path: 'login', component: Login },
  
  { path: 'members', component: MembersPage, canActivate:[OktaAuthGuard],
    data: {
      onAuthRequired: () => {
        // Redirect the user to your custom login page
        window.location.href = '/login';
      }
    }
   },

  {path: 'order-history', component: OrderHistoryComponent, canActivate:[OktaAuthGuard]},
  { path: 'checkout', component: Checkout },
  { path: 'cart-details', component: CartDetails },
  { path: 'products/:id', component: ProductDetails },
  { path: 'search/:keyword', component: ProductList },
  { path: 'category/:id', component: ProductList },
  { path: 'category', component: ProductList },
  { path: 'products', component: ProductList },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products', pathMatch: 'full' }
];

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),

    importProvidersFrom(
      NgbModule,
      ReactiveFormsModule,
      OktaAuthModule
    ),

    { provide: OKTA_CONFIG, useValue: { oktaAuth } },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }
  ]
}).catch(err => console.error(err));

