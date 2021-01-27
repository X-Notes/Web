import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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

  panelOpenState = false;
  isOpened = false;

  mainBlocks: Photo[][] = [];
  lastBlock: Photo[] = [];
  countItemsInMainBlock = 1;

  activeMenu = false;

  @Input()
  content: ContentModel<Photos>;

  constructor(private photoService: PhotoService) { }


  ngOnInit(): void {
    this.initPhotos();
  }

  onLoadImage($event)
  {
    console.log($event);
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
    this.initPhotos();
    this.isOpened = false;
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

  mouseEnterHandler($event) {
    this.activeMenu = true;
  }

  mouseLeaveHandler($event) {
    this.activeMenu = false;
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
