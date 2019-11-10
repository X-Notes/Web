import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllNootsComponent } from './all-noots.component';

describe('AllNootsComponent', () => {
  let component: AllNootsComponent;
  let fixture: ComponentFixture<AllNootsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllNootsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllNootsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
