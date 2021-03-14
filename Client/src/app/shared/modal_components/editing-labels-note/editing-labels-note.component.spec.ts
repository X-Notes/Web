import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditingLabelsNoteComponent } from './editing-labels-note.component';

describe('EditingLabelsNoteComponent', () => {
  let component: EditingLabelsNoteComponent;
  let fixture: ComponentFixture<EditingLabelsNoteComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EditingLabelsNoteComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(EditingLabelsNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
