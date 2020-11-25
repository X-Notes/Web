import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonDefaultBackgroundComponent } from './button-default-background.component';

describe('ButtonDefaultBackgroundComponent', () => {
  let component: ButtonDefaultBackgroundComponent;
  let fixture: ComponentFixture<ButtonDefaultBackgroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonDefaultBackgroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonDefaultBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
