import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IsmaCart } from '../../services/isma-cart.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, CommonModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
})
export class Checkout implements OnInit {
  totalPrice: number = 299.97;
  totalQuantity: number = 3;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  checkoutFormGroup!: FormGroup;

  countries: Country[] = [];
  shippingStates: State[] = [];
  billingStates: State[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private ismaCart: IsmaCart,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initCountryListeners();
    this.initCreditCardData();
    this.loadCountries();
  }

  private initForm(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });
  }

  private initCountryListeners(): void {
    const shippingCountry = this.checkoutFormGroup.get('shippingAddress.country');
    
    if (shippingCountry) {
      shippingCountry.valueChanges.subscribe(countryCode => {
        console.log('Shipping country changed to:', countryCode);
        
        // Update billing country without triggering its change event
        this.checkoutFormGroup.get('billingAddress.country')?.setValue(countryCode, { emitEvent: false });
        
        // Load states for both addresses
        if (countryCode) {
          // Find the country object to get its ID
          const selectedCountry = this.countries.find(c => c.code === countryCode);
          if (selectedCountry) {
            this.loadStatesForAddress('shippingAddress', selectedCountry.code);
            this.loadStatesForAddress('billingAddress', selectedCountry.code);
          }
        } else {
          this.shippingStates = [];
          this.billingStates = [];
        }
      });
    }

    const billingCountry = this.checkoutFormGroup.get('billingAddress.country');
    
    if (billingCountry) {
      billingCountry.valueChanges.subscribe(countryCode => {
        console.log('Billing country changed to:', countryCode);
        
        if (countryCode) {
          const selectedCountry = this.countries.find(c => c.code === countryCode);
          if (selectedCountry) {
            this.loadStatesForAddress('billingAddress', selectedCountry.code);
          }
        } else {
          this.billingStates = [];
        }
      });
    }
  }

  private initCreditCardData(): void {
    const startMonth = new Date().getMonth() + 1;
    
    this.ismaCart.getCreditCardMonths(startMonth).subscribe((data) => {
      this.creditCardMonths = data;
    });

    this.ismaCart.getCreditCardYears().subscribe((data) => {
      this.creditCardYears = data;
    });
  }

  private loadCountries(): void {
    this.ismaCart.getCountries().subscribe((data) => {
      this.countries = data;
      console.log('Retrieved countries:', this.countries);
    });
  }

  private loadStatesForAddress(addressPath: string, countryCode: string): void {
    console.log(`Loading states for country code: ${countryCode}`);
    
    this.ismaCart.getStates(countryCode).subscribe({
      next: (states: State[]) => {
        console.log(`Loaded states:`, states);
        
        if (addressPath === 'shippingAddress') {
          this.shippingStates = states;
          this.checkoutFormGroup.get('shippingAddress.state')?.setValue('');
        } else {
          this.billingStates = states;
          this.checkoutFormGroup.get('billingAddress.state')?.setValue('');
        }
      },
      error: (error) => {
        console.error(`Error loading states:`, error);
        if (addressPath === 'shippingAddress') {
          this.shippingStates = [];
        } else {
          this.billingStates = [];
        }
      },
    });
  }

  onSubmit(){
    console.log("Handling the submit button");
    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log("the email address is " + this.checkoutFormGroup.get('customer')?.value.email);

    console.log("The shipping address country is " + this.checkoutFormGroup.get('shippingAddress')?.value.country);
    console.log("The shipping address state is " + this.checkoutFormGroup.get('shippingAddress')?.value.state);
  }


copyShippingToBilling(event: any) {
  const shippingAddress = this.checkoutFormGroup.get('shippingAddress') as FormGroup;
  const billingAddress = this.checkoutFormGroup.get('billingAddress') as FormGroup;
  
  if (event.target.checked) {
    const shippingValues = shippingAddress.value;
    const shippingCountryCode = shippingValues.country;
    
    // Copy all shipping values to billing
    billingAddress.patchValue({
      street: shippingValues.street,
      city: shippingValues.city,
      zipCode: shippingValues.zipCode,
      country: shippingCountryCode,
      state: shippingValues.state  // This will copy the state.id value
    });
    
    // Load states from server if country exists
    if (shippingCountryCode) {
      this.ismaCart.getStates(shippingCountryCode).subscribe({
        next: (states: State[]) => {
          this.billingStates = states;
          
          // After states loaded, verify the copied state.id exists in the loaded states
          const copiedStateId = shippingValues.state;
          if (copiedStateId && states.some(s => s.id === copiedStateId)) {
            // State already set from patchValue, just keep it
            console.log('State copied successfully:', copiedStateId);
          } else if (copiedStateId) {
            // State doesn't exist in loaded states, clear it
            billingAddress.get('state')?.setValue('');
          }
        },
        error: (error) => {
          console.error('Error loading billing states:', error);
          this.billingStates = [];
          billingAddress.get('state')?.setValue('');
        }
      });
    } else {
      this.billingStates = [];
    }
  } else {
    // Reset billing address
    billingAddress.patchValue({
      street: '',
      city: '',
      state: '',
      zipCode: ''
    });
    
    this.billingStates = [];
    
    // Keep billing country same as shipping for consistency
    const shippingCountry = shippingAddress.get('country')?.value;
    if (shippingCountry) {
      billingAddress.get('country')?.setValue(shippingCountry, { emitEvent: false });
    } else {
      billingAddress.get('country')?.setValue('');
    }
  }
} 
  


  updateCreditCardMonths(): void {
    const selectedYear: number = Number(
      this.checkoutFormGroup.get('creditCard')?.value.expirationYear
    );
    const currentYear: number = new Date().getFullYear();
    const startMonth: number = selectedYear === currentYear ? new Date().getMonth() + 1 : 1;

    this.ismaCart.getCreditCardMonths(startMonth).subscribe((data) => {
      console.log('Retrieved credit card months:', data);
      this.creditCardMonths = data;
    });
  }
}