import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonQuestionComponent } from './button-question.component';

describe('ButtonQuestionComponent', () => {
  let component: ButtonQuestionComponent;
  let fixture: ComponentFixture<ButtonQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
