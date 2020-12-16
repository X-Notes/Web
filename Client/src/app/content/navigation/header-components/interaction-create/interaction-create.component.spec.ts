import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InteractionCreateComponent } from './interaction-create.component';

describe('InteractionCreateComponent', () => {
  let component: InteractionCreateComponent;
  let fixture: ComponentFixture<InteractionCreateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractionCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
