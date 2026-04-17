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
    // check if "id" parameter is available in the route and update currentCategoryId accordingly
    const hasCategoryId: boolean = this.router.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      this.currentCategoryId = +this.router.snapshot.paramMap.get('id')!;
    }
    else {
      this.currentCategoryId = 1;
    }

    // Subscribe to the paramMap observable to react to changes in the route parameters
    this.router.paramMap.subscribe(() => {
      this.listProducts();
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
