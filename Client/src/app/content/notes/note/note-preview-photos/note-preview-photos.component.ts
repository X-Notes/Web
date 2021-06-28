import { Component, Input, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Album } from '../../models/content-model.model';

@Component({
  selector: 'app-note-preview-photos',
  templateUrl: './note-preview-photos.component.html',
  styleUrls: ['./note-preview-photos.component.scss'],
})
export class NotePreviewPhotosComponent implements OnInit {
  @Input()
  album: Album;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  // eslint-disable-next-line class-methods-use-this
  ngOnInit(): void {}
}
