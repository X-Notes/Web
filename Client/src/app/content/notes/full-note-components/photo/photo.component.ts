import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Photo } from '../../models/ContentMode';
import { PhotoService } from '../photos-business-logic/photo.service';

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
      transition('loaded => noLoaded', [
        animate(0)
      ]),
    ])
  ],
  providers: [PhotoService]
})
export class PhotoComponent implements OnInit {

  @Output()
  deleteEvent = new EventEmitter<string>();

  @Input()
  photo: Photo;

  isOpened = false;

  constructor(private photoService: PhotoService) { }

  ngOnInit(): void {
  }

  onLoadImage($event)
  {
    this.photo.loaded = true;
  }

  openMenu($event: MouseEvent) {
    this.isOpened = true;
    this.photoService.setPosition($event.clientY - 20, $event.clientX - 180);
  }

  closeMenu($event: MouseEvent)
  {
    this.isOpened = false;
  }

  deletePhoto()
  {
    this.deleteEvent.emit(this.photo.id);
  }

}
