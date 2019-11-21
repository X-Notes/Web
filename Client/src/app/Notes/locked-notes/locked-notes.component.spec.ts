import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockedNotesComponent } from './locked-notes.component';

describe('LockedNotesComponent', () => {
  let component: LockedNotesComponent;
  let fixture: ComponentFixture<LockedNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockedNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockedNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
