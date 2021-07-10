import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InteractionProfileComponent } from './interaction-profile.component';

describe('InteractionProfileComponent', () => {
  let component: InteractionProfileComponent;
  let fixture: ComponentFixture<InteractionProfileComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [InteractionProfileComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
