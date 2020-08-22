import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditingLabelsNoteComponent } from './editing-labels-note.component';

describe('EditingLabelsNoteComponent', () => {
  let component: EditingLabelsNoteComponent;
  let fixture: ComponentFixture<EditingLabelsNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditingLabelsNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditingLabelsNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
