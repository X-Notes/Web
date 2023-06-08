import {
  AfterViewInit,
  OnDestroy,
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExportService } from 'src/app/content/notes/export.service';
import { ClickableSelectableEntities } from 'src/app/editor/entities-ui/clickable-selectable-entities.enum';
import { CollectionCursorUI } from 'src/app/editor/entities-ui/cursors-ui/collection-cursor-ui';
import { TypeUploadFormats } from 'src/app/editor/entities-ui/files-enums/type-upload-formats.enum';
import { SetFocus, FocusDirection } from 'src/app/editor/entities-ui/set-focus';
import { VideosCollection, VideoModel } from 'src/app/editor/entities/contents/videos-collection';
import { HtmlComponentsFacadeService } from '../../../html-components.facade.service';
import { ParentInteractionCollection } from '../../../parent-interaction.interface';
import { CollectionBaseComponent } from '../../collection.base.component';

@Component({
  selector: 'app-video-note',
  templateUrl: './video-note.component.html',
  styleUrls: ['./video-note.component.scss', '../../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoNoteComponent
  extends CollectionBaseComponent<VideosCollection>
  implements ParentInteractionCollection, AfterViewInit, OnDestroy, OnInit
{
  @ViewChild('videoplayer') videoElement: ElementRef<HTMLVideoElement>;

  @ViewChild('videowrapper') videoWrapper: ElementRef<HTMLElement>;

  @ViewChild('videoPlaylist') videoPlaylist: ElementRef;

  isPlaying = false;

  isFullscreen = false;

  isWideScreen = false;

  volumeHelper: number;

  formats = TypeUploadFormats.videos;

  selectVideoId: string;

  videoTime: number;

  constructor(
    private exportService: ExportService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    facade: HtmlComponentsFacadeService,
  ) {
    super(cdr, ClickableSelectableEntities.Video, facade);
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

  get volumeIcon(): string {
    if (this.videoElement?.nativeElement?.volume === 0) {
      return 'volume_off';
    }
    if (
      this.videoElement?.nativeElement?.volume < 0.5 &&
      this.videoElement?.nativeElement?.volume !== 0
    ) {
      return 'volume_down';
    }
    if (this.videoElement?.nativeElement?.volume >= 0.5) {
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

  get currentVideo(): VideoModel {
    if (this.selectVideoId) {
      return this.content.items.find((x) => x.fileId === this.selectVideoId);
    }
    return this.content.items[0];
  }

  updateVideoTime(): void {
    this.videoTime = this.videoElement.nativeElement.currentTime;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnDestroy = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }
  };

  getCursor$(itemId: string): Observable<CollectionCursorUI> {
    return this.uiCursors$?.pipe(
      map((x) => {
        const array = x.filter((q) => q.itemId === itemId);
        if (array.length > 0) {
          return array[0];
        }
        return null;
      }),
    );
  }

  togglePlay() {
    this.isPlaying = this.videoElement?.nativeElement.paused;
    const action = this.isPlaying ? 'play' : 'pause';
    if (this.videoElement?.nativeElement) {
      this.videoElement?.nativeElement[action]();
    }
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
    if (document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await this.videoElement.nativeElement?.requestPictureInPicture();
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

  onSliderChangeEnd(value: number) {
    this.videoElement.nativeElement.currentTime = value;
  }

  onSliderVolumeChangeEnd(value: number) {
    this.videoElement.nativeElement.volume = value;
  }

  seekVolume(volume) {
    this.videoElement.nativeElement.volume = volume;
  }

  mute() {
    const volume = this.videoElement?.nativeElement.volume;
    if (this.videoElement?.nativeElement.muted) {
      this.videoElement.nativeElement.muted = false;
      this.seekVolume(this.volumeHelper);
    } else {
      this.videoElement.nativeElement.muted = true;
      this.volumeHelper = volume;
      this.seekVolume(0);
    }
  }

  isClicked = (itemId: string): boolean => this.facade.clickableService.isClicked(itemId);

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
      this.clickItemHandler(this.content.items[index + 1].fileId, false);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openThumbVideo(video: VideoModel) {
    if (!this.videoElement?.nativeElement.paused) {
      this.togglePlay();
    }
    this.selectVideoId = video.fileId;
    this.facade.clickableService.setContent(
      this.content,
      video.fileId,
      ClickableSelectableEntities.Video,
      this,
    );
    this.facade.clickableService.cursorChanged$.next(() => this.updateCursor(video.fileId));
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
