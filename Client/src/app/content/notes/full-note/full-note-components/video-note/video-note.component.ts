import {
  AfterViewInit,
  OnDestroy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import { ExportService } from '../../../export.service';
import { VideoModel, VideosCollection } from '../../../models/content-model.model';
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
  content: VideosCollection;

  @Input()
  isReadOnlyMode = false;

  @Output() deleteVideoEvent = new EventEmitter<string>();

  video: HTMLVideoElement;

  isPlaying = false;

  isFullscreen = false;

  isWideScreen = false;

  volumeHelper: number;

  constructor(private exportService: ExportService) {}

  ngAfterViewInit(): void {
    const { nativeElement } = this.videoElement;
    this.video = nativeElement as HTMLVideoElement;
  }

  ngOnDestroy = async () => {
    // @ts-ignore
    if (document.pictureInPictureElement) {
      // @ts-ignore
      await document.exitPictureInPicture();
    }
  };

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
    // @ts-ignore
    if (document.pictureInPictureEnabled) {
      // @ts-ignore
      if (document.pictureInPictureElement) {
        // @ts-ignore
        await document.exitPictureInPicture();
      } else {
        // @ts-ignore
        await this.video?.requestPictureInPicture();
      }
    }
  }

  onFullscreenChange() {
    if (document.fullscreenElement) {
      this.isFullscreen = true;
    } else {
      this.isFullscreen = false;
    }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFocus = ($event?: any) => {};

  setFocusToEnd = () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHTML = (content: string) => {};

  getNative = () => {};

  getContent() {
    return this.content;
  }

  async exportVideos(videos: VideosCollection) {
    await this.exportService.exportVideos(videos);
  }

  async exportVideo(video: VideoModel) {
    await this.exportService.exportVideo(video);
  }

  get isEmpty(): boolean {
    if (!this.content.videos || this.content.videos.length === 0) {
      return true;
    }
    return false;
  }

  get getFirst() {
    if (this.content.videos && this.content.videos.length > 0) {
      return this.content.videos[0];
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter = ($event: any) => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseOut = ($event: any) => {};
}
