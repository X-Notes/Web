import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InteractionToolsComponent } from './interaction-tools.component';

describe('InteractionToolsComponent', () => {
  let component: InteractionToolsComponent;
  let fixture: ComponentFixture<InteractionToolsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractionToolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
