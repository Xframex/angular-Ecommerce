import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IsmaCart } from '../../services/isma-cart.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, CommonModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
})
export class Checkout implements OnInit {

   

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  checkoutFormGroup!: FormGroup;

  countries: Country[] = [];
  shippingStates: State[] = [];
  billingStates: State[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private ismaCart: IsmaCart,
    private cartService: CartService

    

  ) { 
    // review cart data these should be OBSERVABLES, not plain values
   this.reviewCartDetails();
  }
  
  ngOnInit(): void {
    this.initForm();
    this.initCreditCardData();
    this.loadCountries(); // ⬅ load first
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

      creditCard: this.formBuilder.group({
        cardType: ['', Validators.required],
        nameOnCard: ['', [Validators.required, Validators.minLength(3)]],
        cardNumber: ['', [Validators.required, Validators.pattern('[0-9]{16}')]],
        securityCode: ['', [Validators.required, Validators.pattern('[0-9]{3,4}')]],
        expirationMonth: ['', Validators.required],
        expirationYear: ['', Validators.required],
      }),
    });
  }

  // moved here AFTER countries load
  private initCountryListeners(): void {
    const shippingCountry = this.checkoutFormGroup.get('shippingAddress.country');

    shippingCountry?.valueChanges.subscribe(countryCode => {
      console.log('Shipping country changed to:', countryCode);

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
      console.log('Billing country changed to:', countryCode);

      if (countryCode) {
        this.loadStatesForAddress('billingAddress', countryCode);
      } else {
        this.billingStates = [];
      }
    });
  }

  private initCreditCardData(): void {
    const startMonth = new Date().getMonth() + 1;

    this.ismaCart.getCreditCardMonths(startMonth).subscribe(data => {
      this.creditCardMonths = data;
    });

    this.ismaCart.getCreditCardYears().subscribe(data => {
      this.creditCardYears = data;
    });
  }

  private loadCountries(): void {
    this.ismaCart.getCountries().subscribe(data => {
      this.countries = data;
      console.log('Retrieved countries:', this.countries);

      // FIX: init listeners AFTER countries loaded
      this.initCountryListeners();
    });
  }

  //  FIXED getters
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

  get cardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get nameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get cardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get securityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }
  get expirationMonth() { return this.checkoutFormGroup.get('creditCard.expirationMonth'); }
  get expirationYear() { return this.checkoutFormGroup.get('creditCard.expirationYear'); }

  private loadStatesForAddress(addressPath: string, countryCode: string): void {
    console.log(`Loading states for ${addressPath}:`, countryCode);

    this.ismaCart.getStates(countryCode).subscribe({
      next: (states: State[]) => {
        if (addressPath === 'shippingAddress') {
          this.shippingStates = states;
          this.checkoutFormGroup.get('shippingAddress.state')?.setValue(null); // ✅ safer
        } else {
          this.billingStates = states;
          this.checkoutFormGroup.get('billingAddress.state')?.setValue(null); // ✅ safer
        }
      },
      error: (error) => {
        console.error('Error loading states:', error);
      },
    });
  }

  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      console.log("Form is invalid");
      return;
    }

    console.log("Form is valid ✅");
    console.log(this.checkoutFormGroup.value);
  }

  copyShippingToBilling(event: any) {
    const shippingAddress = this.checkoutFormGroup.get('shippingAddress') as FormGroup;
    const billingAddress = this.checkoutFormGroup.get('billingAddress') as FormGroup;

    if (event.target.checked) {
      const values = shippingAddress.value;

      billingAddress.patchValue({
        street: values.street,
        city: values.city,
        zipCode: values.zipCode,
        country: values.country,
        state: values.state
      });

      if (values.country) {
        this.loadStatesForAddress('billingAddress', values.country);
      }
    } else {
      billingAddress.reset();
      this.billingStates = [];
    }
  }

  updateCreditCardMonths(): void {
    const selectedYear = Number(
      this.checkoutFormGroup.get('creditCard.expirationYear')?.value
    );

    const currentYear = new Date().getFullYear();
    const startMonth = selectedYear === currentYear ? new Date().getMonth() + 1 : 1;

    this.ismaCart.getCreditCardMonths(startMonth).subscribe(data => {
      this.creditCardMonths = data;
    });
  }

  // review cart details to subscribe to the observables and update total price and quantity
  reviewCartDetails() {
    // subscribe to the cart totalPrice and totalQuantity observables
    this.cartService.totalPrice.subscribe(totalPrice => {
      this.totalPrice = totalPrice;
    });
    // subscribe to the cart totalQuantity observable
    this.cartService.totalQuantity.subscribe(totalQuantity => {
      this.totalQuantity = totalQuantity;
    });
  }

}