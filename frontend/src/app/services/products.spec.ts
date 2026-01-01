import { TestBed } from '@angular/core/testing';
import { ProductService } from './products';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return products', (done) => {
    service.getProducts().subscribe(products => {
      expect(products).toBeTruthy();
      expect(products.length).toBeGreaterThan(0);
      expect(products[0].name).toBeTruthy();
      done();
    });
  });

  it('should return product by id', (done) => {
    service.getProductById(1).subscribe(product => {
      expect(product).toBeTruthy();
      expect(product?.id).toBe(1);
      done();
    });
  });

  it('should return undefined for non-existent id', (done) => {
    service.getProductById(999).subscribe(product => {
      expect(product).toBeUndefined();
      done();
    });
  });

  it('should update product stock', (done) => {
    const productId = 1;
    const newStock = 15;
    
    
  });
});