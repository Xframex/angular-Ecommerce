import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart-details',
  imports: [CurrencyPipe],
  templateUrl: './cart-details.html',
  styleUrl: './cart-details.css',
})
export class CartDetails implements OnInit {

  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor(private cartService: CartService) {

   }

   ngOnInit(): void {
    this.listCartDetails();
     
   }
  listCartDetails() {
    // get the cart items from the service
    this.cartItems = this.cartService.cartItems;

    // compute totals based on the cart data that is in the service
    this.cartService.computeCartTotals();

    // subscribe to the cart totalPrice and totalQuantity
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

  }




}
