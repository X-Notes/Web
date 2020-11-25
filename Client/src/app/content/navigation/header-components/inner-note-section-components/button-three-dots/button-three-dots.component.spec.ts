import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonThreeDotsComponent } from './button-three-dots.component';

describe('ButtonThreeDotsComponent', () => {
  let component: ButtonThreeDotsComponent;
  let fixture: ComponentFixture<ButtonThreeDotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonThreeDotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonThreeDotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
