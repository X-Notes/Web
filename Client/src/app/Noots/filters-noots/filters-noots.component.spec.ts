import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersNootsComponent } from './filters-noots.component';

describe('FiltersNootsComponent', () => {
  let component: FiltersNootsComponent;
  let fixture: ComponentFixture<FiltersNootsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiltersNootsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersNootsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
