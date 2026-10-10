import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsejoDetalleComponent } from './consejo-detalle.component';

describe('ConsejoDetalleComponent', () => {
  let component: ConsejoDetalleComponent;
  let fixture: ComponentFixture<ConsejoDetalleComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsejoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
