import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-cart-status',
  imports: [],
  templateUrl: './cart-status.html',
  styleUrl: './cart-status.css',
})
export class CartStatus implements OnInit {

  totalPrice: number = 0
  totalQuantity: number = 0

  constructor(private cartservice: CartService) { }

  ngOnInit(): void {
    this.updateCartStatus()
    
  }
  // Method to update the cart status on the UI 
  updateCartStatus() {
    this.cartservice.totalPrice.subscribe(
      data => this.totalPrice = data
    )
    this.cartservice.totalQuantity.subscribe(
      data => this.totalQuantity = data
    )
  }

 

}
