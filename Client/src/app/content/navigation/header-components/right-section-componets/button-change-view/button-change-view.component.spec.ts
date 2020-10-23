import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonChangeViewComponent } from './button-change-view.component';

describe('ButtonChangeViewComponent', () => {
  let component: ButtonChangeViewComponent;
  let fixture: ComponentFixture<ButtonChangeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonChangeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonChangeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
