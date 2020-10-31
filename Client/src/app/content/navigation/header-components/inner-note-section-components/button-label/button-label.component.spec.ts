import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonLabelComponent } from './button-label.component';

describe('ButtonLabelComponent', () => {
  let component: ButtonLabelComponent;
  let fixture: ComponentFixture<ButtonLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
