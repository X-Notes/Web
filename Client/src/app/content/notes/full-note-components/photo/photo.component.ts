import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { ShortUser } from 'src/app/core/models/ShortUser';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { photoInit } from 'src/app/shared/services/personalization.service';
import { Photo } from '../../models/ContentModel';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss'],
  animations: [photoInit],
})
export class PhotoComponent implements OnInit {
  @Output()
  deleteEvent = new EventEmitter<string>();

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Input()
  photo: Photo;

  destroy = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {}

  onLoadImage() {
    this.photo.loaded = true;
  }

  deletePhoto() {
    this.deleteEvent.emit(this.photo.fileId);
  }
}
