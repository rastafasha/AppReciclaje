import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReglasPage } from './reglas.page';

describe('ReglasPage', () => {
  let component: ReglasPage;
  let fixture: ComponentFixture<ReglasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReglasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
