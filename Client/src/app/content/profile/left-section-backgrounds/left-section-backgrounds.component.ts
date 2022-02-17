import { Component, EventEmitter, Output } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { BackgroundStore } from 'src/app/core/backgrounds/background-state';
import { Background } from 'src/app/core/models/background.model';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';

@Component({
  selector: 'app-left-section-backgrounds',
  templateUrl: './left-section-backgrounds.component.html',
  styleUrls: ['./left-section-backgrounds.component.scss'],
})
export class LeftSectionBackgroundsComponent {
  @Select(BackgroundStore.getUserBackgrounds)
  public backgrounds$: Observable<Background[]>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Output() removeBackground = new EventEmitter<string>();

  @Output() setCurrentBackground = new EventEmitter<string>();
}
