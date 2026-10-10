import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenufooterComponent } from './menufooter.component';

describe('MenufooterComponent', () => {
  let component: MenufooterComponent;
  let fixture: ComponentFixture<MenufooterComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenufooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
