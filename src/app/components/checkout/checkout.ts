import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule,CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {
   totalPrice: number = 0.00;
  totalQuantity: number = 0;


  checkoutFormGroup: FormGroup ;

  constructor(private formBuilder: FormBuilder) {
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
  }

  ngOnInit(): void {
    
  }

  onSubmit() {
    console.log("Handling submit button");
    console.log(this.checkoutFormGroup.get('customer')?.value);

}

copyShippingToBilling($event: Event) {
  if (($event.target as HTMLInputElement).checked) {
    this.checkoutFormGroup.controls['billingAddress']
      .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
  } else {
    this.checkoutFormGroup.controls['billingAddress'].reset();

  }


}

}