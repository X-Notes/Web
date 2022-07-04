import {
  AfterViewInit,
  OnDestroy,
  Component,
  ViewChild,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Subject } from 'rxjs';
import { TypeUploadFormats } from '../../../../models/enums/type-upload-formats.enum';
import { ExportService } from '../../../../../export.service';
import { ParentInteraction } from '../../../../models/parent-interaction.interface';
import { ClickableContentService } from '../../../../content-editor-services/clickable-content.service';
import { FocusDirection, SetFocus } from '../../../../models/set-focus';
import { ClickableSelectableEntities } from '../../../../content-editor-services/models/clickable-selectable-entities.enum';
import { CollectionBaseComponent } from '../../collection.base.component';
import { ApiBrowserTextService } from '../../../../../api-browser-text.service';
import {
  VideoModel,
  VideosCollection,
} from 'src/app/content/notes/models/editor-models/videos-collection';
import { SelectionService } from '../../../../content-editor-services/selection.service';

@Component({
  selector: 'app-video-note',
  templateUrl: './video-note.component.html',
  styleUrls: ['./video-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoNoteComponent
  extends CollectionBaseComponent<VideosCollection>
  implements ParentInteraction, AfterViewInit, OnDestroy
{
  @ViewChild('videoplayer') videoElement: ElementRef<HTMLVideoElement>;

  @ViewChild('videowrapper') videoWrapper: ElementRef<HTMLElement>;

  @ViewChild('uploadVideosRef') uploadVideosRef: ElementRef;

  @ViewChild('videoPlaylist') videoPlaylist: ElementRef;

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
    clickableContentService: ClickableContentService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    apiBrowserTextService: ApiBrowserTextService,
    public selectionService: SelectionService,
  ) {
    super(cdr, clickableContentService, apiBrowserTextService, ClickableSelectableEntities.Video);
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

  get isEmpty(): boolean {
    if (!this.content.items || this.content.items.length === 0) {
      return true;
    }
    return false;
  }

  get getMainVideo() {
    if (this.content.items && this.content.items.length > 0) {
      return this.content.items[this.indexVideo];
    }
    return null;
  }

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
    return null;
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

  @HostListener('window:resize', ['$event'])
  onResize = () => {
    const nodes = this.videoPlaylist?.nativeElement?.children;
    if(!nodes) return;
    let width = 0;
    for (let i = 0; i < this.counterSlider; i += 1) {
      width -= nodes[i].getBoundingClientRect().width;
    }
    this.translate = width;
  };

  ngAfterViewInit(): void {
    const nativeElement = this.videoElement?.nativeElement;
    if(!nativeElement) return;
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

  isClicked = (itemId: string) => this.clickableContentService.isClicked(itemId);

  isFocusToNext(entity: SetFocus) {
    if (entity.status === FocusDirection.Up && this.titleComponent.isFocusedOnTitle) {
      return true;
    }
    if (entity.status === FocusDirection.Down) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      return index === this.content.items.length - 1;
    }
    return false;
  }

  setFocus = (entity?: SetFocus) => {
    entity.event.preventDefault();

    const isExist = this.content.items.some((x) => x.fileId === entity?.itemId);
    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.scrollAndFocusToTitle();
      } else {
        this.clickItemHandler(this.content.items[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length > 0) {
      this.clickItemHandler(this.content.items[this.content.items.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length === 0) {
      this.scrollAndFocusToTitle();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      this.clickItemHandler(this.content.items[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.titleComponent.isFocusedOnTitle) {
        // eslint-disable-next-line prefer-destructuring
        this.clickItemHandler(this.content.items[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.scrollAndFocusToTitle();
      }
      this.cdr.detectChanges();
      return;
    }
  };

  setFocusToEnd = () => {};

  getEditableNative = () => {
    return null;
  };

  getHost() {
    return this.host;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter = ($event: any) => {
    this.isMouseOver = true;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
}
