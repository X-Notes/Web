import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InteractionInnerComponent } from './interaction-inner.component';

describe('InteractionInnerComponent', () => {
  let component: InteractionInnerComponent;
  let fixture: ComponentFixture<InteractionInnerComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [InteractionInnerComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionInnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
