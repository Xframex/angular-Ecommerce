import { Component, Inject, OnInit } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './product-list-grid.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products!: Product[];
  currentCategoryId: number = 1;

  // Inject the ProductService
  constructor(
    private productService: ProductService,
    private router: ActivatedRoute,
  ) {}

  ngOnInit(): void { 
    this.listProducts();
    this.router.paramMap.subscribe(params => {
    
    
    const id = params.get('id');
    // if id is not null, convert it to a number and assign to currentCategoryId
    this.currentCategoryId = id ? +id : 1;

    this.listProducts(); // always correct
    });
  }
  // Method to fetch the list of products from the service
  listProducts() {
    // get products for the given category id
    this.productService.getProductList(this.currentCategoryId).subscribe((data) => {
      this.products = data;
    });
  }
}
