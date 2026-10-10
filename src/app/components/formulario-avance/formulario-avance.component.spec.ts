import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioAvancePage } from './formulario-avance.component';

describe('FormularioAvancePage', () => {
  let component: FormularioAvancePage;
  let fixture: ComponentFixture<FormularioAvancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularioAvancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
