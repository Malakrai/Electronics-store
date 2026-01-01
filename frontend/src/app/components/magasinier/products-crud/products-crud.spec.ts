import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsCrud } from './products-crud';

describe('ProductsCrud', () => {
  let component: ProductsCrud;
  let fixture: ComponentFixture<ProductsCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsCrud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsCrud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
