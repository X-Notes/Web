import { Component, Input, OnInit } from '@angular/core';
import { ContentModel, Photos } from '../../models/ContentMode';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss']
})
export class PhotosComponent implements OnInit {

  @Input()
  content: ContentModel<Photos>;

  constructor() { }

  ngOnInit(): void {
  }

}
