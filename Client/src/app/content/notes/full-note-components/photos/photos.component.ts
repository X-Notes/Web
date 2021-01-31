import { Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { ContentModel, Photo, Photos } from '../../models/ContentMode';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { PhotoService } from '../photos-business-logic/photo.service';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss'],
  providers: [PhotoService]
})
export class PhotosComponent implements OnInit, ParentInteraction {

  startWidth;
  startHeight;
  @ViewChild('album') albumChild: ElementRef;

  panelOpenState = false;
  isOpened = false;

  mainBlocks: Photo[][] = [];
  lastBlock: Photo[] = [];
  countItemsInMainBlock = 2;

  @Input()
  content: ContentModel<Photos>;

  constructor(private photoService: PhotoService,
              private renderer: Renderer2) { }


  changeHeight(diffrence: number)
  {
    const newHeight = this.startHeight + diffrence;
    if (newHeight > 200){
    this.renderer.setStyle(this.albumChild.nativeElement, 'height', newHeight + 'px');
    }
  }

  changeWidth(diffrence: number)
  {
    const newWidth = this.startWidth + diffrence;
    if (newWidth > 200){
    this.renderer.setStyle(this.albumChild.nativeElement, 'width', newWidth + 'px');
    }
  }

  saveHeight()
  {
    this.startHeight = this.albumChild.nativeElement.offsetHeight;
  }

  saveWidth()
  {
    this.startWidth = this.albumChild.nativeElement.offsetWidth;
  }

  ngOnInit(): void {
    this.initPhotos();
  }

  openMenu($event: MouseEvent) {
    this.isOpened = true;
    this.photoService.setPosition($event.clientY - 20, $event.clientX - 180);
  }

  closeMenu($event: MouseEvent)
  {
    this.isOpened = false;
    this.panelOpenState = false;
  }

  setPhotosInRow(count: number)
  {
    this.countItemsInMainBlock = count;
    this.panelOpenState = false;
    this.isOpened = false;
    this.setFalseLoadedForAllPhotos();
    this.renderer.setStyle(this.albumChild.nativeElement, 'height', 'auto');
    this.initPhotos();
  }

  setFalseLoadedForAllPhotos()
  {
    for (const mainBlock of this.mainBlocks)
    {
      mainBlock.forEach(z => z.loaded = false);
    }
    this.lastBlock.forEach(z => z.loaded = false);
  }

  initPhotos() {
    this.mainBlocks = [];
    this.lastBlock = [];
    const photoLength = this.content.data.photos.length;
    let j = 0;
    for (let i = 0; i < this.countOfBlocks; i += 1) {
        this.mainBlocks.push(this.content.data.photos.slice(j, j + this.countItemsInMainBlock));
        j += this.countItemsInMainBlock;
    }
    if (this.countLastItems > 0)
    {
      this.lastBlock = this.content.data.photos.slice(photoLength - this.countLastItems, photoLength);
    }
  }

  get countOfBlocks() {
    return Math.floor(this.content.data.photos.length / this.countItemsInMainBlock);
  }


  get countLastItems() {
    return this.content.data.photos.length % this.countItemsInMainBlock;
  }


  getStyle(numb: number)
  {
    switch (numb)
    {
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
    }
  }

  setFocus($event?: any) {
    throw new Error('Method not implemented.');
  }

  setFocusToEnd() {
    throw new Error('Method not implemented.');
  }

  updateHTML(content: string) {
    throw new Error('Method not implemented.');
  }

  getNative() {
    throw new Error('Method not implemented.');
  }

  getContent() {
    return this.content;
  }

  mouseEnter($event: any) {
    throw new Error('Method not implemented.');
  }

  mouseOut($event: any) {
    throw new Error('Method not implemented.');
  }

}
