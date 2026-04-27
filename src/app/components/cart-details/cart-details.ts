import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-details',
  imports: [CurrencyPipe],
  templateUrl: './cart-details.html',
  styleUrl: './cart-details.css',
})
export class CartDetails {

  constructor(public cartService: CartService) { }



}
