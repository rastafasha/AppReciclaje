import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HojaAnimadaComponent } from './hoja-animada.component';

describe('HojaAnimadaComponent', () => {
  let component: HojaAnimadaComponent;
  let fixture: ComponentFixture<HojaAnimadaComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HojaAnimadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
