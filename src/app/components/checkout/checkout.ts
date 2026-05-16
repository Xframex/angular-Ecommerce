import { CommonModule, CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { IsmaCart } from '../../services/isma-cart.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { Router } from '@angular/router';
import { StripeService } from '../../services/stripe.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, CommonModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
})
export class Checkout implements OnInit, AfterViewInit {

  totalPrice: number = 0;
  totalQuantity: number = 0;
  checkoutFormGroup!: FormGroup;

  countries: Country[] = [];
  shippingStates: State[] = [];
  billingStates: State[] = [];

  processing = false;
  stripeCardComplete = false;
  cardError = '';

  @ViewChild('cardElement') cardElementRef!: ElementRef;

  private elements: any = null;
  private card: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private ismaCart: IsmaCart,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router,
    private stripeService: StripeService
  ) {
    this.reviewCartDetails();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCountries();

    const theEmail = localStorage.getItem('email');
    this.checkoutFormGroup.controls['customer'].patchValue({ email: theEmail });
  }

  async ngAfterViewInit(): Promise<void> {
    const stripe = await this.stripeService.getStripe();
    if (!stripe) return;

    this.elements = (stripe as any).elements();
    this.card = this.elements.create('card', {
      style: {
        base: { fontSize: '16px', color: '#32325d' },
        invalid: { color: '#dc3545' }
      }
    });
    this.card.mount(this.cardElementRef.nativeElement);

    this.card.on('change', (event: any) => {
      this.stripeCardComplete = event.complete;
      this.cardError = event.error ? event.error.message : '';
    });
  }

  private initForm(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern('[a-zA-Z]+')]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern('[a-zA-Z]+')]],
        email: ['', [Validators.required, Validators.email]],
      }),
      shippingAddress: this.formBuilder.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
      }),
      billingAddress: this.formBuilder.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
      }),
    });
  }

  private initCountryListeners(): void {
    const shippingCountry = this.checkoutFormGroup.get('shippingAddress.country');
    shippingCountry?.valueChanges.subscribe(countryCode => {
      this.checkoutFormGroup.get('billingAddress.country')
        ?.setValue(countryCode, { emitEvent: false });
      if (countryCode) {
        this.loadStatesForAddress('shippingAddress', countryCode);
        this.loadStatesForAddress('billingAddress', countryCode);
      } else {
        this.shippingStates = [];
        this.billingStates = [];
      }
    });

    const billingCountry = this.checkoutFormGroup.get('billingAddress.country');
    billingCountry?.valueChanges.subscribe(countryCode => {
      if (countryCode) this.loadStatesForAddress('billingAddress', countryCode);
      else this.billingStates = [];
    });
  }

  private loadCountries(): void {
    this.ismaCart.getCountries().subscribe(data => {
      this.countries = data;
      this.initCountryListeners();
    });
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingState() { return this.checkoutFormGroup.get('shippingAddress.state'); }

  get billingStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingState() { return this.checkoutFormGroup.get('billingAddress.state'); }

  private loadStatesForAddress(addressPath: string, countryCode: string): void {
    this.ismaCart.getStates(countryCode).subscribe({
      next: (states: State[]) => {
        if (addressPath === 'shippingAddress') {
          this.shippingStates = states;
          this.checkoutFormGroup.get('shippingAddress.state')?.setValue(null);
        } else {
          this.billingStates = states;
          this.checkoutFormGroup.get('billingAddress.state')?.setValue(null);
        }
      },
      error: (error) => console.error('Error loading states:', error),
    });
  }

  async onSubmit(): Promise<void> {
    if (this.checkoutFormGroup.invalid || !this.stripeCardComplete) {
      this.checkoutFormGroup.markAllAsTouched();
      if (!this.stripeCardComplete) this.cardError = 'Please complete the card details';
      return;
    }

    this.processing = true;
    this.cardError = '';

    const order = new Order(this.totalQuantity, this.totalPrice);
    const cartItems = this.cartService.cartItems;
    const orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // build purchase object
    const purchase = new Purchase();
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingStateId = this.checkoutFormGroup.get('shippingAddress.state')?.value;
    const shippingSelectedState = this.shippingStates.find(s => s.id === shippingStateId);
    const shippingCountryCode = this.checkoutFormGroup.get('shippingAddress.country')?.value;
    const shippingSelectedCountry = this.countries.find(c => c.code === shippingCountryCode);
    purchase.shippingAddress.state = shippingSelectedState?.name || '';
    purchase.shippingAddress.country = shippingSelectedCountry?.name || '';
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingStateId = this.checkoutFormGroup.get('billingAddress.state')?.value;
    const billingSelectedState = this.billingStates.find(s => s.id === billingStateId);
    const billingCountryCode = this.checkoutFormGroup.get('billingAddress.country')?.value;
    const billingSelectedCountry = this.countries.find(c => c.code === billingCountryCode);
    purchase.billingAddress.state = billingSelectedState?.name || '';
    purchase.billingAddress.country = billingSelectedCountry?.name || '';
    purchase.order = order;
    purchase.orderItems = orderItems;

    try {
      // Step 1: Create PaymentIntent on backend
      const amountInCents = Math.round(this.totalPrice * 100);
      const paymentResponse = await lastValueFrom(this.checkoutService.createPaymentIntent(amountInCents, 'usd'));
      const clientSecret = paymentResponse.clientSecret;

      // Step 2: Confirm card with Stripe
      const result = await this.stripeService.confirmCardPayment(clientSecret, this.card);
      if (result.error) {
        this.cardError = result.error.message || 'Payment failed';
        this.processing = false;
        return;
      }

      if (result.paymentIntent?.status !== 'succeeded') {
        this.cardError = 'Payment was not successful';
        this.processing = false;
        return;
      }

      // Step 3: Place order with paymentIntentId
      purchase.paymentIntentId = result.paymentIntent.id;
      this.checkoutService.placeOrder(purchase).subscribe({
        next: (response) => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
          this.resetCart();
        },
        error: (error) => {
          console.error('Error placing order:', error.message);
          this.cardError = 'Failed to save order. Contact support.';
          this.processing = false;
        }
      });
    } catch (err: any) {
      console.error('Payment error:', err);
      this.cardError = err.message || 'An unexpected error occurred';
      this.processing = false;
    }
  }

  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.checkoutFormGroup.reset();
    this.router.navigateByUrl('/products');
  }

  copyShippingToBilling(event: any) {
    const shippingAddress = this.checkoutFormGroup.get('shippingAddress') as FormGroup;
    const billingAddress = this.checkoutFormGroup.get('billingAddress') as FormGroup;
    if (event.target.checked) {
      const values = shippingAddress.value;
      billingAddress.patchValue({
        street: values.street, city: values.city,
        zipCode: values.zipCode, country: values.country, state: values.state
      });
      if (values.country) this.loadStatesForAddress('billingAddress', values.country);
    } else {
      billingAddress.reset();
      this.billingStates = [];
    }
  }

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(totalPrice => this.totalPrice = totalPrice);
    this.cartService.totalQuantity.subscribe(totalQuantity => this.totalQuantity = totalQuantity);
  }
}
