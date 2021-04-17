import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DarkGeneralHeaderButtonComponent } from './dark-general-header-button.component';

describe('DarkGeneralHeaderButtonComponent', () => {
  let component: DarkGeneralHeaderButtonComponent;
  let fixture: ComponentFixture<DarkGeneralHeaderButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DarkGeneralHeaderButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DarkGeneralHeaderButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
