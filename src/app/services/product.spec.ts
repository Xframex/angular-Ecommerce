import { Product } from '../common/product';
import 'jasmine';


describe('Product', () => {
  it('should create an instance', () => {
    const product = new Product(
      'SKU001',      // sku
      'Test Product', // name
      'Test Description',  // description
      99.99,         // unitPrice
      'test.jpg',    // imageUrl
      true,          // active
      10,            // unitsInStock
      new Date(),    // dateCreated
      new Date()     // lastUpdated
    );
    expect(product).toBeTruthy();
  });
});


