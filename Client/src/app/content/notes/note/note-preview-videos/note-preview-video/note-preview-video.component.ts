import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-note-preview-video',
  templateUrl: './note-preview-video.component.html',
  styleUrls: ['./note-preview-video.component.scss'],
})
export class NotePreviewVideoComponent {
  @Input()
  url: string;

  @ViewChild('video')
  video: ElementRef<HTMLVideoElement>;

  isLoaded = true;

  setLoadingFalse() {
    this.isLoaded = false;
  }

  onMouseEnter() {
    if (!this.isLoaded) {
      this.video.nativeElement.play();
    }
  }

  onMouseLeave() {
    if (!this.isLoaded) {
      this.video.nativeElement.pause();
    }
  }
}
