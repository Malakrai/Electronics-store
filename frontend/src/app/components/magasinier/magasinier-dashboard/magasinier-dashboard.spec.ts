import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagasinierDashboard } from './magasinier-dashboard';

describe('MagasinierDashboard', () => {
  let component: MagasinierDashboard;
  let fixture: ComponentFixture<MagasinierDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagasinierDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagasinierDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
