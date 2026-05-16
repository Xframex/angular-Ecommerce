import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublishableKey);
  }

  async getStripe(): Promise<Stripe | null> {
    return await this.stripePromise;
  }

  async confirmCardPayment(clientSecret: string, cardElement: any): Promise<any> {
    const stripe = await this.getStripe();
    if (!stripe) throw new Error('Stripe failed to load');
    return await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    });
  }
}
