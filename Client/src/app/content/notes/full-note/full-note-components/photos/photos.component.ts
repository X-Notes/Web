import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ExportService } from '../../../export.service';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { SelectionService } from '../../content-editor-services/selection.service';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { FocusDirection, SetFocus } from '../../models/set-focus';
import { ClickableSelectableEntities } from '../../content-editor-services/clickable-selectable-entities.enum';
import { CollectionService } from '../collection-services/collection.service';
import { Photo, PhotosCollection } from '../../../models/editor-models/photos-collection';
import { ContentEditorPhotosCollectionService } from '../../content-editor-services/file-content/content-editor-photos.service';
@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotosComponent
  extends CollectionService<PhotosCollection>
  implements OnInit, OnDestroy, AfterViewInit, OnChanges, ParentInteraction {
  @ViewChild('album') albumChild: ElementRef;

  @ViewChild('uploadPhotos') uploadPhoto: ElementRef;

  startWidth;

  startHeight;

  mainBlocks: Photo[][] = [];

  lastBlock: Photo[] = [];

  mainContainer;

  destroy = new Subject<void>();

  changeWidthSubject = new Subject<string>();

  changeHeightSubject = new Subject<string>();

  changeSizeAlbumHalder = combineLatest([this.changeWidthSubject, this.changeHeightSubject]);

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private selectionService: SelectionService,
    private exportService: ExportService,
    clickableContentService: ClickableContentService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    private contentEditorPhotosService: ContentEditorPhotosCollectionService,
  ) {
    super(cdr, clickableContentService);
  }


  ngOnChanges(): void {
    this.updateHeightByNativeOffset();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngAfterViewInit(): void {
    this.mainContainer =
      this.elRef.nativeElement.parentElement.parentElement.parentElement.parentElement; // TODO PIZDEC REMOVE THIS
  }

  uploadHandler = () => {
    this.uploadPhoto.nativeElement.click();
  };

  async uploadImages(files: File[]) {
    if (files?.length > 0) {
      this.uploadEvent.emit({ contentId: this.content.id, files: [...files] });
    }
  }

  clickPhotoHandler(photoId: string) {
    this.clickableContentService.set(ClickableSelectableEntities.Photo, photoId, this.content.id);
  }

  changeWidth(diffrence: number) {
    const paddingMainContainer = 100; // main-content padding left, right
    const mainContainerWidth = this.mainContainer.offsetWidth - paddingMainContainer;
    const newWidth = this.startWidth + diffrence;
    const procent = ((newWidth / mainContainerWidth) * 100).toFixed(3);
    if (newWidth > 200 && newWidth < mainContainerWidth) {
      this.renderer.setStyle(this.albumChild.nativeElement, 'width', `${procent}%`);
      this.changeWidthSubject.next(`${procent}%`);
    }
    if (newWidth >= mainContainerWidth) {
      this.renderer.setStyle(this.albumChild.nativeElement, 'width', '100%');
      this.changeWidthSubject.next('100%');
    }
  }

  changeHeight(difference: number) {
    const newHeight = this.startHeight + difference;
    if (newHeight > 200) {
      this.renderer.setStyle(this.albumChild.nativeElement, 'height', `${newHeight}px`);
    }
    this.changeHeightSubject.next(`${newHeight}px`);
  }

  updateHeightByNativeOffset() {
    setTimeout(() => {
      const height = `${this.albumChild?.nativeElement.offsetHeight}px`;
      if (this.content.height !== height) {
        this.changeHeightSubject.next(height);
      }
    }, 50);
  }

  saveWidth() {
    this.startWidth = this.albumChild.nativeElement.offsetWidth;
  }

  saveHeight(isResizingPhoto: boolean) {
    this.startHeight = this.albumChild.nativeElement.offsetHeight;
    this.selectionService.isResizingPhoto = isResizingPhoto;
  }

  ngOnInit(): void {
    for (const photo of this.content.items) {
      photo.loaded = false;
    }
    this.changeSizeAlbumHalder
      .pipe(takeUntil(this.destroy), debounceTime(500)) // TODO export const
      .subscribe((values) => {
        const [width, height] = values;
        this.content.width = width;
        this.content.height = height;
        if (width && height && (this.content.height !== height || this.content.width !== width)) {
          this.content.width = width;
          this.content.height = height;
          this.someChangesEvent.emit();
        }
      });

    this.changeHeightSubject.next(this.content.height);
    this.changeWidthSubject.next(this.content.width);
    this.initPhotos();
  }

  async setPhotosInRow(count: number) {
    this.content.countInRow = count;
    
    this.setFalseLoadedForAllPhotos();
    this.renderer.setStyle(this.albumChild.nativeElement, 'height', 'auto');
    this.changeHeightSubject.next(`height`);
    this.initPhotos();
    this.updateHeightByNativeOffset();
  }

  setFalseLoadedForAllPhotos() {
    for (const mainBlock of this.mainBlocks) {
      mainBlock.forEach((z) => {
        const item = { ...z };
        item.loaded = false;
      });
    }
    this.lastBlock.forEach((z) => {
      const item = { ...z };
      item.loaded = false;
    });
  }

  async exportAlbum() {
    await this.exportService.exportAlbum(this.content);
  }

  async exportPhoto(photo: Photo) {
    await this.exportService.exportPhoto(photo);
  }

  initPhotos() {
    this.content.countInRow = this.content.countInRow === 0 ? 2 : this.content.countInRow;
    this.mainBlocks = [];
    this.lastBlock = [];
    const photoLength = this.content.items.length;
    let j = 0;
    for (let i = 0; i < this.countOfBlocks; i += 1) {
      this.mainBlocks.push(this.content.items.slice(j, j + this.content.countInRow));
      j += this.content.countInRow;
    }
    if (this.countLastItems > 0) {
      this.lastBlock = this.content.items.slice(photoLength - this.countLastItems, photoLength);
    }
  }

  get countOfBlocks() {
    return Math.floor(this.content.items.length / this.content.countInRow);
  }

  get countLastItems() {
    return this.content.items.length % this.content.countInRow;
  }

  get totalRows() {
    return this.countLastItems ? this.mainBlocks.length + 1 : this.mainBlocks.length;
  }

  get isEmpty(): boolean {
    if (!this.content.items || this.content.items.length === 0) {
      return true;
    }
    return false;
  }


  getStyle = (numb: number) => {
    switch (numb) {
      case 1: {
        return 'one-child';
      }
      case 2: {
        return 'two-child';
      }
      case 3: {
        return 'three-child';
      }
      case 4: {
        return 'fouth-child';
      }
      default: {
        throw new Error('Style not found');
      }
    }
  };

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
    const isExist = this.content.items.some((x) => x.fileId === entity.itemId);

    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.titleComponent.focusOnTitle();
        this.clickPhotoHandler(null);
      } else {
        this.clickPhotoHandler(this.content.items[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length > 0) {
      this.clickPhotoHandler(this.content.items[this.content.items.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length === 0) {
      this.titleComponent.focusOnTitle();
      this.clickPhotoHandler(null);
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      this.clickPhotoHandler(this.content.items[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.titleComponent.isFocusedOnTitle) {
        // eslint-disable-next-line prefer-destructuring
        this.clickPhotoHandler(this.content.items[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.titleComponent.focusOnTitle();
        this.clickPhotoHandler(null);
      }
    }
  };

  setFocusToEnd = () => {};

  getEditableNative = () => {
    return null;
  };

  getContent(): PhotosCollection {
    return this.content;
  }

  getContentId(): string {
    return this.content.id;
  }

  getHost() {
    return this.host;
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
