import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonSelectAllComponent } from './button-select-all.component';

describe('ButtonSelectAllComponent', () => {
  let component: ButtonSelectAllComponent;
  let fixture: ComponentFixture<ButtonSelectAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonSelectAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonSelectAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
