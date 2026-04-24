import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';


@Injectable({
  providedIn: 'root',
})
export class ProductService {

 
 


  private baseUrl = 'http://localhost:8080/api/products';
   


  constructor(private httpClient: HttpClient) { }

  getProductList(theCategoryId: number): Observable<Product[]> {
    // build URL based on category id
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.getProducts(searchUrl);
  }

  // method to fetch the products from the backend based on category id, page and size and return an Observable of Product array
  getProductListPaginate(thePage: number, 
                         thePageSize: number, 
                         theCategoryId: number): Observable<GetResponseProducts>{
    // build URL based on category id, page and size
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl);
                         }



  // method to fetch the product categories from the backend and return an Observable of ProductCategory array
   getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(`http://localhost:8080/api/product-category`).pipe(
      map(response => response._embedded.productCategory)
    );
  } 

   // method to search for products based on the keyword and return an Observable of Product array
   searchProducts(theKeyword: string) : Observable<Product[]> {
    // build URL based on keyword
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;

    return this.getProducts(searchUrl);
    
  }
  getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }


    getProduct(theProductId: number) : Observable<Product> {
    // build URL based on product id
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  } 

}



// define interfaces to hold JSON response for products and product categories
interface GetResponseProducts {
  _embedded: {
    products: Product[];
  }
  // pagination information  page: {
   page: number;
   size: number;
   totalElements: number;
   totalPages: number;

  
}
// interface to hold JSON response for product categories
interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }

  
}

