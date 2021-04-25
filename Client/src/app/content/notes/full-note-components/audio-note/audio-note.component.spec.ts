import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioNoteComponent } from './audio-note.component';

describe('AudioNoteComponent', () => {
  let component: AudioNoteComponent;
  let fixture: ComponentFixture<AudioNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
