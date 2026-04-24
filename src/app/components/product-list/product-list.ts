import { Component, Inject, OnInit } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbPagination } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from '@angular/forms';



@Component({
  imports: [CurrencyPipe, CommonModule, RouterLink, NgbPagination, FormsModule],
  templateUrl: './product-list-grid.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {


  products: Product[] = [];
  currentCategoryId: number = 1;
  searchMode: boolean = false;


  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;
  previousCategoryId: number = 1;
  previousKeyword: string = "";
  
  



  // Inject the ProductService
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void { 
    this.listProducts();
    this.route.paramMap.subscribe(params => {
    
    
    const id = params.get('id');
    // if id is not null, convert it to a number and assign to currentCategoryId
    this.currentCategoryId = id ? +id : 1;

    this.listProducts(); // always correct
    });
  }
  // Method to fetch the list of products from the service
  listProducts() {

    // check if "keyword" parameter is available
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handleListProducts();
    }

  }

  handleSearchProducts() {

    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    //if we have different keyword than previous
    //the set the page to 1
    if (this.previousKeyword ! = theKeyword){
      this.thePageNumber = 1; 
    }
    this.previousKeyword = theKeyword;
    console.log(`keyword=${theKeyword},thePageNumber=${this.thePageNumber}`);


    //  search for the products using keyword 
    this.productService.searchProductsPaginate(this.thePageNumber - 1, 
                                             this.thePageSize,theKeyword).subscribe(
                                               this.processResult()
                                              )
    
  }
  // Method to fetch the list of products from the service by using pagination
  processResult(){ 
    return ( data: any) => {
      this.products = data._embedded.products;  
      this.thePageNumber = data.page.number + 1; // because Spring Data REST page numbers are 0-based
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }

  

 updatePageSize(arg0: string) {
    this.thePageSize = +arg0;
    this.thePageNumber = 1;
    this.listProducts();
    
  }

  handleListProducts() {

    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }
    else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
    }

    //check if we have a different category than previous one
    // Note: Angular will reuse a component if it is currently being viewed
    // this is linked lis DS to the fact that we are using the same component for different categories.
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;
     //debug log to show current category id and page number
    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);



    // now get the products for the given category id
    this.productService.getProductListPaginate(this.thePageNumber - 1, this.thePageSize, this.currentCategoryId).subscribe(
      data => {
        this.products = data._embedded.products;  
        this.thePageNumber = data.page.number + 1; // because Spring Data REST page numbers are 0-based
        this.thePageSize = data.page.size;
        this.theTotalElements = data.page.totalElements;
      }
    )    
  }
}

