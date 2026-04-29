import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IsmaCart } from '../../services/isma-cart.service';


@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule,CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {
  


  totalPrice: number = 0.00;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];


  checkoutFormGroup: FormGroup ;

  constructor(private formBuilder: FormBuilder,
              private ismaCart: IsmaCart  
    )
            
 {
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

  // populate credit card months
  const startMonth: number = new Date().getMonth() + 1;
  console.log("startMonth: " + startMonth);
  this.ismaCart.getCreditCardMonths(startMonth).subscribe(
    data => {
      console.log("Received credit card months: " + JSON.stringify(data));
      this.creditCardMonths = data;
    }
    );
    
  // populate credit card years
  this.ismaCart.getCreditCardYears().subscribe(
    data => {
      console.log("Received credit card years: " + JSON.stringify(data));
      this.creditCardYears = data;
    }
    );




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