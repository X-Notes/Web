import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ContentModel, Photo, Photos } from '../../models/ContentMode';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss']
})
export class PhotosComponent implements OnInit {

  mainBlocks: Photo[][] = [];
  lastBlock: Photo[] = [];

  activeMenu = false;

  @Input()
  content: ContentModel<Photos>;

  constructor() { }

  ngOnInit(): void {
    this.initPhotos();
  }

  initPhotos() {
    console.log('Total ', this.content.data.photos);
    const photoLength = this.content.data.photos.length;
    let j = 0;
    for (let i = 0; i < this.countOfBlocks; i += 1) {
        this.mainBlocks.push(this.content.data.photos.slice(j, j + this.countItemsInMainBlock));
        j += this.countItemsInMainBlock;
    }
    console.log('MainBlocks ', this.mainBlocks);
    console.log(this.countLastItems);
    if (this.countLastItems > 0)
    {
      this.lastBlock = this.content.data.photos.slice(photoLength - this.countLastItems, photoLength);
    }
    console.log('Last ', this.lastBlock);
  }

  get countOfBlocks() {
    return Math.floor(this.content.data.photos.length / this.countItemsInMainBlock);
  }

  get countItemsInMainBlock()
  {
    return 4;
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

  get getMainBlockClass()
  {
    switch (this.countItemsInMainBlock)
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

  get getLastBlockClass()
  {
    switch (this.countLastItems)
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


}
