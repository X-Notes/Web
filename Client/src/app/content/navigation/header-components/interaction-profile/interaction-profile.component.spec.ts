import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractionProfileComponent } from './interaction-profile.component';

describe('InteractionProfileComponent', () => {
  let component: InteractionProfileComponent;
  let fixture: ComponentFixture<InteractionProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractionProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
