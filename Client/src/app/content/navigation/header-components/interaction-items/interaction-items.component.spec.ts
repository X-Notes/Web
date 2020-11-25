import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractionItemsComponent } from './interaction-items.component';

describe('InteractionItemsComponent', () => {
  let component: InteractionItemsComponent;
  let fixture: ComponentFixture<InteractionItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractionItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
