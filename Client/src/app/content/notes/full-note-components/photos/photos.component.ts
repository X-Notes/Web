import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Photo, Album } from '../../models/ContentMode';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { UploadPhotosToAlbum } from '../../models/uploadPhotosToAlbum';
import { SelectionService } from '../../selection.service';
import { PhotoService } from '../photos-business-logic/photo.service';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss'],
  providers: [PhotoService],
})
export class PhotosComponent implements OnInit, AfterViewInit, ParentInteraction {
  @ViewChild('album') albumChild: ElementRef;

  @ViewChild('uploadPhotos') uploadPhoto: ElementRef;

  @Output()
  deleteEvent = new EventEmitter<string>();

  @Output()
  uploadEvent = new EventEmitter<UploadPhotosToAlbum>();

  @Input()
  content: Album;

  startWidth;

  startHeight;

  panelOpenState = false;

  isOpened = false;

  mainBlocks: Photo[][] = [];

  lastBlock: Photo[] = [];

  mainContainer;

  constructor(
    private photoService: PhotoService,
    private renderer: Renderer2,
    private elRef: ElementRef,
    private selectionService: SelectionService,
  ) {}

  ngAfterViewInit(): void {
    this.mainContainer = this.elRef.nativeElement.parentElement.parentElement.parentElement.parentElement;
  }

  changeHeight(diffrence: number) {
    const newHeight = this.startHeight + diffrence;
    if (newHeight > 200) {
      this.renderer.setStyle(this.albumChild.nativeElement, 'height', `${newHeight}px`);
    }
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
    const wrapperWidth = 40; // wrapper weight;
    const paddingMainContainer = 60; // main-content padding left, right
    const mainContainerWidth = this.mainContainer.offsetWidth - paddingMainContainer;
    const newWidth = this.startWidth + diffrence;
    const procent = ((newWidth / mainContainerWidth) * 100).toFixed(3);
    if (newWidth > 200 && newWidth < mainContainerWidth - wrapperWidth) {
      this.renderer.setStyle(this.albumChild.nativeElement, 'width', `${procent}%`);
    }
    if (newWidth >= mainContainerWidth - wrapperWidth) {
      // eslint-disable-next-line no-useless-concat
      this.renderer.setStyle(this.albumChild.nativeElement, 'width', 'calc(100% - 40px)' + '%');
    }
  }

  saveHeight(isResizingPhoto: boolean) {
    this.startHeight = this.albumChild.nativeElement.offsetHeight;
    this.selectionService.isResizingPhoto = isResizingPhoto;
  }

  saveWidth() {
    this.startWidth = this.albumChild.nativeElement.offsetWidth;
  }

  ngOnInit(): void {
    for (const photo of this.content.photos) {
      photo.loaded = false;
    }
    this.initPhotos();
  }

  openMenu($event: MouseEvent) {
    this.isOpened = true;
    this.photoService.setPosition($event.clientY - 20, $event.clientX - 180);
  }

  closeMenu() {
    this.isOpened = false;
    this.panelOpenState = false;
  }

  setPhotosInRow(count: number) {
    this.content.countInRow = count;
    this.panelOpenState = false;
    this.isOpened = false;
    this.setFalseLoadedForAllPhotos();
    this.renderer.setStyle(this.albumChild.nativeElement, 'height', 'auto');
    this.initPhotos();
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

  removePhotoHandler(id: string) {
    this.content.photos = this.content.photos.filter((x) => x.id !== id);
    this.initPhotos();
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
        console.log('not found');
      }
    }
  };

  setFocus = ($event?: any) => {
    console.log($event);
    throw new Error('Method not implemented.');
  };

  setFocusToEnd = () => {
    throw new Error('Method not implemented.');
  };

  updateHTML = (content: string) => {
    console.log(content);
    throw new Error('Method not implemented.');
  };

  getNative = () => {
    throw new Error('Method not implemented.');
  };

  getContent() {
    return this.content;
  }

  mouseEnter = ($event: any) => {
    console.log($event);
    throw new Error('Method not implemented.');
  };

  mouseOut = ($event: any) => {
    console.log($event);
  };
}
