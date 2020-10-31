import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonDeleteLabelsComponent } from './button-delete-labels.component';

describe('ButtonDeleteLabelsComponent', () => {
  let component: ButtonDeleteLabelsComponent;
  let fixture: ComponentFixture<ButtonDeleteLabelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonDeleteLabelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonDeleteLabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
