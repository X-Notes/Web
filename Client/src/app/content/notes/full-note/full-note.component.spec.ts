import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FullNoteComponent } from './full-note.component';

describe('FullNoteComponent', () => {
  let component: FullNoteComponent;
  let fixture: ComponentFixture<FullNoteComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FullNoteComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FullNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
