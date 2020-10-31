import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonHistoryComponent } from './button-history.component';

describe('ButtonHistoryComponent', () => {
  let component: ButtonHistoryComponent;
  let fixture: ComponentFixture<ButtonHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
