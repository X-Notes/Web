import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotePreviewTextComponent } from './note-preview-text.component';

describe('NotePreviewTextComponent', () => {
  let component: NotePreviewTextComponent;
  let fixture: ComponentFixture<NotePreviewTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotePreviewTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotePreviewTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
