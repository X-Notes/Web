import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractionLabelsComponent } from './interaction-labels.component';

describe('InteractionLabelsComponent', () => {
  let component: InteractionLabelsComponent;
  let fixture: ComponentFixture<InteractionLabelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractionLabelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionLabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
