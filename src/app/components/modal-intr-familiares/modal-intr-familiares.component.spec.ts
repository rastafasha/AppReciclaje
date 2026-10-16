import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalIntrFamiliaresComponent } from './modal-intr-familiares.component';

describe('ModalIntrFamiliaresComponent', () => {
  let component: ModalIntrFamiliaresComponent;
  let fixture: ComponentFixture<ModalIntrFamiliaresComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalIntrFamiliaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
