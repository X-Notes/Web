import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DeleteAllFromBin } from 'src/app/content/labels/state/labels-actions';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-button-delete-labels',
  templateUrl: './button-delete-labels.component.html',
  styleUrls: ['./button-delete-labels.component.scss']
})
export class ButtonDeleteLabelsComponent implements OnInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;
  theme = Theme;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  deleteAllLabels() {
    this.store.dispatch(new DeleteAllFromBin());
  }
}
