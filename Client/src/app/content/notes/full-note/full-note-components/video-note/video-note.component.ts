import { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { VideoModel } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';

@Component({
  selector: 'app-video-note',
  templateUrl: './video-note.component.html',
  styleUrls: ['./video-note.component.scss'],
})
export class VideoNoteComponent implements ParentInteraction, AfterViewInit, OnDestroy {
  @ViewChild('videoplayer') videoElement;

  @ViewChild('videowrapper') videoWrapper;
  
  @Input()
  content: VideoModel;

  @Input()
  isReadOnlyMode = false;

  @Output() deleteVideoEvent = new EventEmitter<string>();

  video: HTMLVideoElement;

  isPlaying = false;

  isFullscreen = false;

  isWideScreen = false;
  
  volumeHelper: number;

  ngAfterViewInit(): void {
    const { nativeElement } = this.videoElement;
    this.video = <HTMLVideoElement>nativeElement;
  }

  async ngOnDestroy(): Promise<void> {
    if (document['pictureInPictureElement']) {
      // @ts-ignore
      await document.exitPictureInPicture()
    } 
  }

  togglePlay() {
    this.isPlaying = this.video.paused;
    const action = this.isPlaying ? 'play' : 'pause';
    this.video[action]();
  }

  toggleWideScreen() {
    this.isWideScreen = !this.isWideScreen;
  }

  async toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    if (this.isFullscreen) {
      await this.videoWrapper.nativeElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }

  async togglePictureInPicture() {
    if (document['pictureInPictureEnabled']) {
      if (document['pictureInPictureElement']) {
        // @ts-ignore
        await document.exitPictureInPicture()
      } else {
        // @ts-ignore
        await this.video?.requestPictureInPicture();
      }
    }
  }

  onFullscreenChange() {
    document.fullscreenElement ? this.isFullscreen = true : this.isFullscreen = false;
  }

  onSliderChangeEnd(evt) {
    this.video.currentTime = evt.value;
  }

  onSliderVolumeChangeEnd(evt) {
    this.video.volume = evt.value;
  }

  seekVolume(volume) {
    this.video.volume = volume;
  }

  mute() {
    const { volume } = this.video;
    if (this.video.muted) {
      this.video.muted = false;
      this.seekVolume(this.volumeHelper);
    } else {
      this.video.muted = true;
      this.volumeHelper = volume;
      this.seekVolume(0);
    }
  }

  setFocus = ($event?: any) => {
    console.log($event);
  };

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {
    console.log(content);
  };

  getNative = () => {};

  getContent() {
    return this.content;
  }

  mouseEnter = ($event: any) => {
    console.log($event);
  };

  mouseOut = ($event: any) => {
    console.log($event);
  };
}
