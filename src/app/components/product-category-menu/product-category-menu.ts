import { Component } from '@angular/core';
import { ProductCategory } from '../../common/product-category';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { RouterLinkWithHref, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-product-category-menu',
  imports: [CommonModule, RouterLinkWithHref, RouterLinkActive],
  templateUrl: './product-category-menu.html',
  styleUrl: './product-category-menu.css',
})
export class ProductCategoryMenu {

  // define properties and methods for the product category menu component here
  productCategories: ProductCategory[] = [];

  // inject the product category service here to fetch the categories from the backend
  constructor(private productService: ProductService) {}

  ngOnInit() {
    // initialize the product categories here
    this.listProductCategories();
  }

  // method to fetch the product categories from the backend
  listProductCategories() {
    this.productService.getProductCategories().subscribe(
      data => {
        console.log('Product Categories = ' + JSON.stringify(data));
        this.productCategories = data;
      }
    );
  }
}