import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoNoteComponent } from './video-note.component';

describe('VideoNoteComponent', () => {
  let component: VideoNoteComponent;
  let fixture: ComponentFixture<VideoNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
