import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOnEntityCardComponent } from './user-on-entity-card.component';

describe('UserOnEntityCardComponent', () => {
  let component: UserOnEntityCardComponent;
  let fixture: ComponentFixture<UserOnEntityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserOnEntityCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserOnEntityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
