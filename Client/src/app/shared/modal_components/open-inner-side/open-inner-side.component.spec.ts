import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenInnerSideComponent } from './open-inner-side.component';

describe('OpenInnerSideComponent', () => {
  let component: OpenInnerSideComponent;
  let fixture: ComponentFixture<OpenInnerSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenInnerSideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenInnerSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
