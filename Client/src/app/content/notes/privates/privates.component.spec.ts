import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PrivatesComponent } from './privates.component';

describe('PrivatesComponent', () => {
  let component: PrivatesComponent;
  let fixture: ComponentFixture<PrivatesComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PrivatesComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
