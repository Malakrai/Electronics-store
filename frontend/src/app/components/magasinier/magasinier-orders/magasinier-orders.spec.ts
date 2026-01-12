import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagasinierOrders } from './magasinier-orders';

describe('MagasinierOrders', () => {
  let component: MagasinierOrders;
  let fixture: ComponentFixture<MagasinierOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagasinierOrders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagasinierOrders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
