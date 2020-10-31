import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCircleComponent } from './user-circle.component';

describe('UserCircleComponent', () => {
  let component: UserCircleComponent;
  let fixture: ComponentFixture<UserCircleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserCircleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
