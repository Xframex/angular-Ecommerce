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

    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(map(response => response._embedded.products)
    );
  }

  // method to fetch the product categories from the backend and return an Observable of ProductCategory array
   getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(`http://localhost:8080/api/product-category`).pipe(
      map(response => response._embedded.productCategory)
    );
  } 

}
// define interfaces to hold JSON response for products and product categories
interface GetResponseProducts {
  _embedded: {
    products: Product[];
  }
  
}
// interface to hold JSON response for product categories
interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
  
}

