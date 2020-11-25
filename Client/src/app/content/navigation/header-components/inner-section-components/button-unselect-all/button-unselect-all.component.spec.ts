import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonUnselectAllComponent } from './button-unselect-all.component';

describe('ButtonUnselectAllComponent', () => {
  let component: ButtonUnselectAllComponent;
  let fixture: ComponentFixture<ButtonUnselectAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonUnselectAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonUnselectAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
