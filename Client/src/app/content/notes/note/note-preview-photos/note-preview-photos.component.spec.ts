import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotePreviewPhotosComponent } from './note-preview-photos.component';

describe('NotePreviewPhotosComponent', () => {
  let component: NotePreviewPhotosComponent;
  let fixture: ComponentFixture<NotePreviewPhotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotePreviewPhotosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotePreviewPhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
