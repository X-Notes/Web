import { Component, HostBinding, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Input() size: number;

  @HostBinding('style.--target-color')
  @Input()
  color: string;
}
