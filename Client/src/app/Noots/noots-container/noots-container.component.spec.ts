import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NootsContainerComponent } from './noots-container.component';

describe('NootsContainerComponent', () => {
  let component: NootsContainerComponent;
  let fixture: ComponentFixture<NootsContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NootsContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NootsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
