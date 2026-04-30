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

  onSubmit(): void {
    console.log('Form Data:', this.checkoutFormGroup.value);
  }

  copyShippingToBilling(event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      const shippingAddress = this.checkoutFormGroup.get('shippingAddress')?.value;
      this.checkoutFormGroup.get('billingAddress')?.setValue({
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        zipCode: shippingAddress.zipCode,
      });
      
      this.billingStates = [...this.shippingStates];
    } else {
      const currentCountry = this.checkoutFormGroup.get('billingAddress.country')?.value;
      this.checkoutFormGroup.get('billingAddress')?.reset({
        street: '',
        city: '',
        state: '',
        country: currentCountry,
        zipCode: '',
      });

      if (currentCountry) {
        const selectedCountry = this.countries.find(c => c.code === currentCountry);
        if (selectedCountry) {
          this.loadStatesForAddress('billingAddress', selectedCountry.code);
        }
      } else {
        this.billingStates = [];
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