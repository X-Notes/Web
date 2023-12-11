import { Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from '../enums/theme.enum';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  @Select(UserStore.getUser)
  public user$?: Observable<ShortUser>;

  @Select(UserStore.getUserTheme)
  public theme$?: Observable<ThemeENUM>;

  @Input() size?: number;

  @Input() isBackground = true;

  @Input()
  color?: string;

  get spinnerColor$(): Observable<any> {
    return this.theme$.pipe(map(theme => {
      if (this.color) {
        return { 'border': `2px solid ${this.color}`, 'border-bottom-color': 'transparent' }
      }
      const border = theme === ThemeENUM.Dark ? '2px solid #ffffff' : '2px solid rgb(134 134 134)';
      return { 'border': border, 'border-bottom-color': 'transparent' }
    }));
  }
}
