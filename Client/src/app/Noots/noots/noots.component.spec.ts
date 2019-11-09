import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NootsComponent } from './noots.component';

describe('NootsComponent', () => {
  let component: NootsComponent;
  let fixture: ComponentFixture<NootsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NootsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NootsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
