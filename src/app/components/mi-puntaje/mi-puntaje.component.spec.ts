import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiPuntajePage } from './mi-puntaje.component';

describe('MiPuntajePage', () => {
  let component: MiPuntajePage;
  let fixture: ComponentFixture<MiPuntajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MiPuntajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
