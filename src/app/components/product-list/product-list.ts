import { Component, Inject, OnInit } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe,CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {

  products: Product[] = [];
  
  // Inject the ProductService
  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.listProducts();
  }
  // Method to fetch the list of products from the service
  listProducts() {
    // Call the getProductList method of the ProductService and subscribe to the Observable
    this.productService.getProductList().subscribe(
      data => {
        this.products = data;
      }
    );
  }

}
