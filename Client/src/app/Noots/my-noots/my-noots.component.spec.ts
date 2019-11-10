import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyNootsComponent } from './my-noots.component';

describe('MyNootsComponent', () => {
  let component: MyNootsComponent;
  let fixture: ComponentFixture<MyNootsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyNootsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyNootsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
