import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IsmaCart } from '../../services/isma-cart.service';
import { Country } from '../../common/country';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, CommonModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  checkoutFormGroup!: FormGroup;

  countries: Country[] = [];

  constructor(private formBuilder: FormBuilder,
              private ismaCart: IsmaCart,
            ) {}

  ngOnInit(): void {

    // FORM
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),

      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),

      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),

      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    // ✅ AUTO-SYNC: When shipping country changes, automatically update billing country
    const shippingCountry = this.checkoutFormGroup.get('shippingAddress.country');
    
    if (shippingCountry) {
      shippingCountry.valueChanges.subscribe(countryValue => {
        // Update billing country without triggering another valueChanges event
        this.checkoutFormGroup.get('billingAddress.country')?.setValue(countryValue, { emitEvent: false });
      });
    }

    // LOAD MONTHS
    const startMonth = new Date().getMonth() + 1;

    this.ismaCart.getCreditCardMonths(startMonth).subscribe(data => {
      this.creditCardMonths = data;
    });

    // LOAD YEARS
    this.ismaCart.getCreditCardYears().subscribe(data => {
      this.creditCardYears = data;
    });

    // LOAD COUNTRIES
    this.ismaCart.getCountries().subscribe(data => {
      this.countries = data;
      console.log("Retrieved countries:"+ JSON.stringify(this.countries));
    });
  }

  onSubmit() {
    console.log("Form Data:", this.checkoutFormGroup.value);
  }

  // UPDATED: Copy full shipping address to billing when checkbox is checked
  copyShippingToBilling(event: Event) {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      // Copy entire shipping address to billing address
      const shippingAddress = this.checkoutFormGroup.get('shippingAddress')?.value;
      this.checkoutFormGroup.get('billingAddress')?.setValue({
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        zipCode: shippingAddress.zipCode
      });
    } else {
      // Reset only the fields that aren't being auto-synced
      // We keep the country auto-sync active, so only reset other fields
      const currentCountry = this.checkoutFormGroup.get('billingAddress.country')?.value;
      this.checkoutFormGroup.get('billingAddress')?.reset({
        street: '',
        city: '',
        state: '',
        country: currentCountry, // Preserve the auto-synced country
        zipCode: ''
      });
    }
  }

  // CUSTOM METHOD TO HANDLE MONTHS BASED ON YEAR
  updateCreditCardMonths() {
    const selectedYear: number = Number(this.checkoutFormGroup.get('creditCard')?.value.expirationYear);
    const currentYear: number = new Date().getFullYear();
    let startMonth: number;

    if (selectedYear === currentYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.ismaCart.getCreditCardMonths(startMonth).subscribe(data => {
      console.log("Retrieved credit card months:"+ JSON.stringify(data));
      this.creditCardMonths = data; 
    });
  }
}