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
import { Store } from '@ngxs/store';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ApiServiceNotes } from '../../../api-notes.service';
import { ExportService } from '../../../export.service';
import { Photo, Album } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { RemovePhotoFromAlbum } from '../../../models/remove-photo-from-album.model';
import { UploadFileToEntity as UploadFilesToEntity } from '../../models/upload-files-to-entity';
import { SelectionService } from '../../services/selection.service';
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
  deleteEvent = new EventEmitter<string>();

  @Output()
  deletePhotoFromAlbum = new EventEmitter<RemovePhotoFromAlbum>();

  @Output()
  uploadEvent = new EventEmitter<UploadFilesToEntity>();

  @Input()
  content: Album;

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
    private api: ApiServiceNotes,
    private store: Store,
    private exportService: ExportService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngAfterViewInit(): void {
    this.mainContainer = this.elRef.nativeElement.parentElement.parentElement.parentElement.parentElement;
  }

  removeHandler() {
    this.deleteEvent.emit(this.content.id);
  }

  uploadHandler = () => {
    this.uploadPhoto.nativeElement.click();
  };

  async uploadImages(event) {
    const data = new FormData();
    const { files } = event.target;
    for (const file of files) {
      data.append('photos', file);
    }
    this.uploadEvent.emit({ id: this.content.id, formData: data });
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
    console.log(this.content.photos[0].photoFromBig);
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

  removePhotoHandler(photoId: string) {
    this.deletePhotoFromAlbum.emit({ photoId, contentId: this.content.id });
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
