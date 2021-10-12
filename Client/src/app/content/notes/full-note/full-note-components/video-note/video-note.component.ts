import {
  AfterViewInit,
  OnDestroy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';

import { ExportService } from '../../../export.service';
import { VideoModel, VideosCollection } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';

@Component({
  selector: 'app-video-note',
  templateUrl: './video-note.component.html',
  styleUrls: ['./video-note.component.scss'],
})
export class VideoNoteComponent implements ParentInteraction, AfterViewInit, OnDestroy {
  @ViewChild('videoplayer') videoElement: ElementRef<HTMLVideoElement>;

  @ViewChild('videowrapper') videoWrapper: ElementRef<HTMLElement>;

  @ViewChild('uploadAudiosRef') uploadAudiosRef: ElementRef;

  @ViewChild('videoPlaylist') videoPlaylist: ElementRef;

  @Input()
  content: VideosCollection;

  @Input()
  isReadOnlyMode = false;

  @Output() deleteVideoEvent = new EventEmitter<string>();

  @Output()
  uploadEvent = new EventEmitter<UploadFileToEntity>();

  video: HTMLVideoElement;

  isPlaying = false;

  isFullscreen = false;

  isWideScreen = false;

  counterSlider = 0;

  volumeHelper: number;

  formats = TypeUploadFormats.VIDEOS;

  translate = 0;

  indexVideo = 0;

  constructor(private exportService: ExportService) {}

  @HostListener('window:resize', ['$event'])
  onResize = () => {
    const nodes = this.videoPlaylist.nativeElement.children;
    let width = 0;
    for (let i = 0; i < this.counterSlider; i += 1) {
      width -= nodes[i].getBoundingClientRect().width;
    }
    this.translate = width;
  };

  ngAfterViewInit(): void {
    const { nativeElement } = this.videoElement;
    this.video = nativeElement;
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

  uploadHandler = () => {
    this.uploadAudiosRef.nativeElement.click();
  };

  deleteVideoHandler() {
    this.deleteVideoEvent.emit(this.content.id);
  }

  // may is need in further

  // isInViewport(element) {
  //   const rect = element.getBoundingClientRect();
  //   return (
  //     rect.top >= 0 &&
  //     rect.left >= 0 &&
  //     rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
  //     rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  //   );
  // }

  async toNextElement() {
    const nodes = this.videoPlaylist.nativeElement.children;
    this.counterSlider += 1;
    const nextIndex = this.counterSlider + this.visibleItemsCount;
    if (nodes[nextIndex - 1]) {
      const { width } = nodes[nextIndex - 1].getBoundingClientRect();
      this.translate -= width;
    } else {
      this.counterSlider -= 1;
    }
  }

  async toPrevElement() {
    const nodes = this.videoPlaylist.nativeElement.children;
    this.counterSlider -= 1;
    const nextIndex = this.counterSlider + this.visibleItemsCount;
    if (nextIndex >= this.visibleItemsCount) {
      const { width } = nodes[nextIndex].getBoundingClientRect();
      this.translate += width;
    } else {
      this.counterSlider += 1;
    }
  }

  openThumbVideo(index) {
    if (!this.video.paused) {
      this.togglePlay();
    }
    this.indexVideo = index;
  }

  async uploadAudios(event) {
    const files = event.target.files as File[];
    if (files?.length > 0) {
      this.uploadEvent.emit({ contentId: this.content.id, files: [...files] });
    }
  }

  get fullWidth() {
    const nodes = this.videoPlaylist.nativeElement.children;
    let width = 0;
    if (nodes && !nodes.length) return width;
    for (const node of nodes) {
      width += node.clientWidth;
    }
    return width;
  }

  get playlistWidth() {
    return this.videoPlaylist.nativeElement.clientWidth;
  }

  get visibleItemsCount() {
    if (!this.videoPlaylist) return 0;
    const nodes = this.videoPlaylist.nativeElement.children;
    if (nodes && !nodes.length) return 0;
    return Math.round(this.playlistWidth / nodes[0].getBoundingClientRect().width);
  }

  get itemsCount() {
    if (!this.videoPlaylist) return 0;
    const nodes = this.videoPlaylist.nativeElement.children;
    return nodes.length;
  }

  get isEmpty(): boolean {
    if (!this.content.videos || this.content.videos.length === 0) {
      return true;
    }
    return false;
  }

  get getMainVideo() {
    if (this.content.videos && this.content.videos.length > 0) {
      return this.content.videos[this.indexVideo];
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter = ($event: any) => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseOut = ($event: any) => {};
}
