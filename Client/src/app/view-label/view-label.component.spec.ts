import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLabelComponent } from './view-label.component';

describe('ViewLabelComponent', () => {
  let component: ViewLabelComponent;
  let fixture: ComponentFixture<ViewLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
