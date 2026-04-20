import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { Routes, provideRouter } from '@angular/router';
import { ProductList } from './app/components/product-list/product-list';

// Define routes
const routes: Routes = [

  {path: 'search/:keyword', component: ProductList},
  { path: 'category/:id', component: ProductList },
  { path: 'category', component: ProductList },
  { path: 'products', component: ProductList },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products', pathMatch: 'full' }
];

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideRouter(routes) // Provide the router with the defined routes
  ]
});