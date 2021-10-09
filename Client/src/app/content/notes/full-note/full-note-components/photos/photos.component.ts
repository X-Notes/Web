import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ExportService } from '../../../export.service';
import { Photo, PhotosCollection } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { UploadFileToEntity as UploadFilesToEntity } from '../../models/upload-files-to-entity';
import { SelectionService } from '../../content-editor-services/selection.service';
import { ApiAlbumService } from '../../services/api-album.service';
import {
  ClickableContentService,
  ClickableSelectableEntities,
} from '../../content-editor-services/clickable-content.service';
@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss'],
})
export class PhotosComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {
  @ViewChild('album') albumChild: ElementRef;

  @ViewChild('uploadPhotos') uploadPhoto: ElementRef;

  @Input()
  noteId: string;

  @Output()
  deleteContentEvent = new EventEmitter<string>();

  @Output()
  deletePhotoEvent = new EventEmitter<string>();

  @Output()
  uploadEvent = new EventEmitter<UploadFilesToEntity>();

  @Input()
  content: PhotosCollection;

  @Input()
  isReadOnlyMode = false;

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
    private api: ApiAlbumService,
    private exportService: ExportService,
    private clickableContentService: ClickableContentService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngAfterViewInit(): void {
    this.mainContainer = this.elRef.nativeElement.parentElement.parentElement.parentElement.parentElement;
  }

  deleteContentHandler() {
    this.deleteContentEvent.emit(this.content.id);
  }

  uploadHandler = () => {
    this.uploadPhoto.nativeElement.click();
  };

  async uploadImages(event) {
    const files = event.target.files as File[];
    if (files?.length > 0) {
      this.uploadEvent.emit({ contentId: this.content.id, files: [...files] });
    }
  }

  clickPhotoHandler(photo: Photo) {
    this.clickableContentService.set(
      ClickableSelectableEntities.Photo,
      photo.fileId,
      this.content.id,
    );
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

  saveWidth() {
    this.startWidth = this.albumChild.nativeElement.offsetWidth;
  }

  saveHeight(isResizingPhoto: boolean) {
    this.startHeight = this.albumChild.nativeElement.offsetHeight;
    this.selectionService.isResizingPhoto = isResizingPhoto;
  }

  ngOnInit(): void {
    for (const photo of this.content.photos) {
      photo.loaded = false;
    }
    this.changeSizeAlbumHalder
      .pipe(takeUntil(this.destroy), debounceTime(500)) // TODO export const
      .subscribe(async (values) => {
        const [width, height] = values;
        if (width && height && (this.content.height !== height || this.content.width !== width)) {
          await this.api.updateAlbumSize(this.noteId, this.content.id, width, height).toPromise();
        }
      });

    this.changeHeightSubject.next(this.content.height);
    this.changeWidthSubject.next(this.content.width);
    this.initPhotos();
  }

  async setPhotosInRow(count: number) {
    const resp = await this.api.updateCountInRow(this.noteId, this.content.id, count).toPromise();
    if (resp.success) {
      this.content.countInRow = count;
      this.setFalseLoadedForAllPhotos();
      this.renderer.setStyle(this.albumChild.nativeElement, 'height', 'auto');
      this.changeHeightSubject.next(`height`);
      this.initPhotos();
    }
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
    this.mainBlocks = [];
    this.lastBlock = [];
    const photoLength = this.content.photos.length;
    let j = 0;
    for (let i = 0; i < this.countOfBlocks; i += 1) {
      this.mainBlocks.push(this.content.photos.slice(j, j + this.content.countInRow));
      j += this.content.countInRow;
    }
    if (this.countLastItems > 0) {
      this.lastBlock = this.content.photos.slice(photoLength - this.countLastItems, photoLength);
    }
  }

  get countOfBlocks() {
    return Math.floor(this.content.photos.length / this.content.countInRow);
  }

  get countLastItems() {
    return this.content.photos.length % this.content.countInRow;
  }

  get totalRows() {
    return this.countLastItems ? this.mainBlocks.length + 1 : this.mainBlocks.length;
  }

  get isEmpty(): boolean {
    if (!this.content.photos || this.content.photos.length === 0) {
      return true;
    }
    return false;
  }

  deletePhotoHandler(photoId: string) {
    this.deletePhotoEvent.emit(photoId);
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

  setFocus = ($event?: any) => {};

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {};

  getNative = () => {};

  getContent() {
    return this.content;
  }

  mouseEnter = ($event: any) => {};

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
    const photoId = this.clickableContentService.id;
    if (
      this.clickableContentService.collectionId === this.content.id &&
      this.content.photos.some((x) => x.fileId === photoId)
    ) {
      this.deletePhotoEvent.emit(photoId);
    }
  }
}
