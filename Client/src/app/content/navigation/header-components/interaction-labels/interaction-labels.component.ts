import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Select, Store } from '@ngxs/store';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-interaction-labels',
  templateUrl: './interaction-labels.component.html',
  styleUrls: ['./interaction-labels.component.scss']
})
export class InteractionLabelsComponent implements OnInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  deleteAllLabels() {
  }

}
