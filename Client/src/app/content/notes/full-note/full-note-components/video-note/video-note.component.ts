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
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { Subject } from 'rxjs';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';
import { ExportService } from '../../../export.service';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { FocusDirection, SetFocus } from '../../models/set-focus';
import { ClickableSelectableEntities } from '../../content-editor-services/clickable-selectable-entities.enum';
import { CollectionService } from '../collection-services/collection.service';
import { VideoModel, VideosCollection } from '../../../models/editor-models/videos-collection';
import { ContentEditorVideosCollectionService } from '../../content-editor-services/file-content/content-editor-videos.service';

@Component({
  selector: 'app-video-note',
  templateUrl: './video-note.component.html',
  styleUrls: ['./video-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoNoteComponent
  extends CollectionService
  implements ParentInteraction, AfterViewInit, OnInit, OnDestroy
{
  @ViewChild('videoplayer') videoElement: ElementRef<HTMLVideoElement>;

  @ViewChild('videowrapper') videoWrapper: ElementRef<HTMLElement>;

  @ViewChild('uploadVideosRef') uploadVideosRef: ElementRef;

  @ViewChild('videoPlaylist') videoPlaylist: ElementRef;

  @Input()
  noteId: string;

  @Input()
  content: VideosCollection;

  @Input()
  theme: ThemeENUM;

  @Output()
  deleteVideoEvent = new EventEmitter<string>();

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

  constructor(
    private exportService: ExportService,
    private clickableContentService: ClickableContentService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    private contentEditorVideosService: ContentEditorVideosCollectionService,
  ) {
    super(cdr);
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

  async onTitleChangeInput(name: string) {
    await this.contentEditorVideosService.updateCollectionInfo(this.content.id, this.noteId, name);
  }

  ngOnInit(): void {}

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

  get volumeIcon(): string {
    if (this.video?.volume === 0) {
      return 'volume_off';
    }
    if (this.video?.volume < 0.5 && this.video?.volume !== 0) {
      return 'volume_down';
    }
    if (this.video?.volume >= 0.5) {
      return 'volume_up';
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

  isFocusToNext(entity: SetFocus) {
    if (entity.status === FocusDirection.Up && this.titleComponent.isFocusedOnTitle) {
      return true;
    }
    if (entity.status === FocusDirection.Down) {
      const index = this.content.videos.findIndex((x) => x.fileId === entity.itemId);
      return index === this.content.videos.length - 1;
    }
    return false;
  }

  setFocus = (entity?: SetFocus) => {
    const isExist = this.content.videos.some((x) => x.fileId === entity?.itemId);

    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.videos.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.titleComponent.focusOnTitle();
        this.clickVideoHandler(null);
      } else {
        this.clickVideoHandler(this.content.videos[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.videos.length > 0) {
      this.clickVideoHandler(this.content.videos[this.content.videos.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.videos.length === 0) {
      this.titleComponent.focusOnTitle();
      this.clickVideoHandler(null);
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.videos.findIndex((x) => x.fileId === entity.itemId);
      this.clickVideoHandler(this.content.videos[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.titleComponent.isFocusedOnTitle) {
        // eslint-disable-next-line prefer-destructuring
        this.clickVideoHandler(this.content.videos[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.titleComponent.focusOnTitle();
        this.clickVideoHandler(null);
      }
    }
  };

  setFocusToEnd = () => {};

  getEditableNative = () => {
    return null;
  };

  getHost() {
    return this.host;
  }

  getContent(): VideosCollection {
    return this.content;
  }

  getContentId(): string {
    return this.content.id;
  }

  async exportVideos(videos: VideosCollection) {
    await this.exportService.exportVideos(videos);
  }

  async exportVideo(video: VideoModel) {
    await this.exportService.exportVideo(video);
  }

  uploadHandler = () => {
    this.uploadVideosRef.nativeElement.click();
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

  async uploadVideos(files: File[]) {
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

  mouseEnter = ($event: any) => {
    this.isMouseOver = true;
  };

  mouseLeave = ($event: any) => {
    this.isMouseOver = false;
  };

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
