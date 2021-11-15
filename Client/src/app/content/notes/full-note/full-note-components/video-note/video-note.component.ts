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
  OnInit,
} from '@angular/core';

import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { Subject } from 'rxjs';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';
import { ExportService } from '../../../export.service';
import { VideoModel, VideosCollection } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { FocusDirection, SetFocus } from '../../models/set-focus';
import { ClickableSelectableEntities } from '../../content-editor-services/clickable-selectable-entities.enum';

@Component({
  selector: 'app-video-note',
  templateUrl: './video-note.component.html',
  styleUrls: ['./video-note.component.scss'],
})
export class VideoNoteComponent implements ParentInteraction, AfterViewInit, OnInit, OnDestroy {
  @ViewChild('videoplayer') videoElement: ElementRef<HTMLVideoElement>;

  @ViewChild('videowrapper') videoWrapper: ElementRef<HTMLElement>;

  @ViewChild('uploadAudiosRef') uploadAudiosRef: ElementRef;

  @ViewChild('videoPlaylist') videoPlaylist: ElementRef;

  @ViewChild('titleHtml') titleHtml: ElementRef;

  @Input()
  content: VideosCollection;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  theme: ThemeENUM;

  @Output()
  deleteContentEvent = new EventEmitter<string>();

  @Output()
  deleteVideoEvent = new EventEmitter<string>();

  @Output()
  uploadEvent = new EventEmitter<UploadFileToEntity>();

  @Output()
  changeTitleEvent = new EventEmitter<string>();

  video: HTMLVideoElement;

  isPlaying = false;

  isFullscreen = false;

  isWideScreen = false;

  counterSlider = 0;

  volumeHelper: number;

  formats = TypeUploadFormats.videos;

  translate = 0;

  indexVideo = 0;

  destroy = new Subject<void>();

  titleCollectionChanged: Subject<string> = new Subject<string>();

  constructor(
    private exportService: ExportService,
    private clickableContentService: ClickableContentService,
    private host: ElementRef,
  ) {
  }

  @HostListener('window:resize', ['$event'])
  onResize = () => {
    const nodes = this.videoPlaylist.nativeElement.children;
    let width = 0;
    for (let i = 0; i < this.counterSlider; i += 1) {
      width -= nodes[i].getBoundingClientRect().width;
    }
    this.translate = width;
  };

  onTitleChangeInput($event) {
    this.titleCollectionChanged.next($event.target.innerText);
  }

  ngOnInit(): void {
    this.titleCollectionChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((name) => {
        this.content.name = name;
        this.changeTitleEvent.emit(name);
      });
  }

  ngAfterViewInit(): void {
    const { nativeElement } = this.videoElement;
    this.video = nativeElement;
  }

  ngOnDestroy = async () => {
    this.destroy.next();
    this.destroy.complete();
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

  clickVideoHandler(videoId: string) {
    this.clickableContentService.set(ClickableSelectableEntities.Video, videoId, this.content.id);
  }

  isClicked = (itemId: string) => this.clickableContentService.isClicked(itemId);

  isTitleFocused = (): boolean => document.activeElement === this.titleHtml.nativeElement;
  
  isFocusToNext(entity: SetFocus) {
    if (entity.status === FocusDirection.Up && this.isTitleFocused()) {
      return true;
    }
    if (entity.status === FocusDirection.Down) {
      const index = this.content.videos.findIndex((x) => x.fileId === entity.itemId);
      return index === this.content.videos.length - 1;
    }
    return false;
  }

  setFocus = (entity?: SetFocus) => {
    const isExist = this.content.videos.some((x) => x.fileId === entity.itemId);

    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.videos.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.titleHtml.nativeElement.focus();
        this.clickVideoHandler(null);
      } else {
        this.clickVideoHandler(this.content.videos[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      return;
    }

    if (entity.status === FocusDirection.Up) {
      this.clickVideoHandler(this.content.videos[this.content.videos.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.videos.findIndex((x) => x.fileId === entity.itemId);
      this.clickVideoHandler(this.content.videos[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.isTitleFocused()) {
        // eslint-disable-next-line prefer-destructuring
        this.clickVideoHandler(this.content.videos[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.titleHtml.nativeElement.focus();
        this.clickVideoHandler(null);
      }
    }
  };

  setFocusToEnd = () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHTML = (content: string) => {};

  getEditableNative = () => {};

  getHost() {
    return this.host;
  }

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

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  backspaceDown() {
    this.checkForDelete();
  }

  deleteDown() {
    this.checkForDelete();
  }

  checkForDelete() {
    const video = this.content.videos.find((x) => this.clickableContentService.isClicked(x.fileId));
    if (video) {
      this.deleteVideoEvent.emit(video.fileId);
    }
  }
}
