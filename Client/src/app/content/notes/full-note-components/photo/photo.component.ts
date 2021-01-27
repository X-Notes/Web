import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { Photo } from '../../models/ContentMode';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss'],
  animations: [
    trigger('photoInit',
    [
      state('noLoaded', style({
        opacity: 0,
      })),
      state('loaded', style({
        opacity: 1,
      })),
      transition('noLoaded => loaded', [
        animate('0.35s ease-out')
      ]),
    ])
  ]
})
export class PhotoComponent implements OnInit {

  @Input()
  photo: Photo;

  constructor() { }

  ngOnInit(): void {
  }

  onLoadImage($event)
  {
    this.photo.loaded = true;
    console.log($event);
  }

}
