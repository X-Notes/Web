import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InteractionLabelsComponent } from './interaction-labels.component';

describe('InteractionLabelsComponent', () => {
  let component: InteractionLabelsComponent;
  let fixture: ComponentFixture<InteractionLabelsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [InteractionLabelsComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionLabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
