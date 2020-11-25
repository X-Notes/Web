import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-button-video',
  templateUrl: './button-video.component.html',
  styleUrls: ['./button-video.component.scss']
})
export class ButtonVideoComponent implements OnInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;
  theme = Theme;


  constructor() { }

  ngOnInit(): void {
  }

}
