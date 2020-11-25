import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonVideoComponent } from './button-video.component';

describe('ButtonVideoComponent', () => {
  let component: ButtonVideoComponent;
  let fixture: ComponentFixture<ButtonVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
