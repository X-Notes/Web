import { Component, Input, OnInit } from '@angular/core';
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
        this.mainBlocks.push(this.content.data.photos.slice(j, j + this.countItemsInBlock));
        j += this.countItemsInBlock;
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
    return Math.floor(this.content.data.photos.length / this.countItemsInBlock);
  }

  get countItemsInBlock()
  {
    return 3;
  }

  get countLastItems() {
    return this.content.data.photos.length % 3;
  }

  mouseEnterHandler($event) {
    this.activeMenu = true;
  }

  mouseLeaveHandler($event) {
    this.activeMenu = false;
  }

}
