import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IsmaCart } from '../../services/isma-cart.service';

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

  constructor(private formBuilder: FormBuilder,
              private ismaCart: IsmaCart) {}

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

    // LOAD MONTHS
    const startMonth = new Date().getMonth() + 1;

    this.ismaCart.getCreditCardMonths(startMonth).subscribe(data => {
      this.creditCardMonths = data;
    });

    // LOAD YEARS
    this.ismaCart.getCreditCardYears().subscribe(data => {
      this.creditCardYears = data;
    });
  }

  onSubmit() {
    console.log("Form Data:", this.checkoutFormGroup.value);
  }

  copyShippingToBilling(event: Event) {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      this.checkoutFormGroup.get('billingAddress')
        ?.setValue(this.checkoutFormGroup.get('shippingAddress')?.value);
    } else {
      this.checkoutFormGroup.get('billingAddress')?.reset();
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