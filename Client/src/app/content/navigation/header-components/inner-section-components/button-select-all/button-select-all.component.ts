import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { SelectAllFolder } from 'src/app/content/folders/state/folders-actions';
import { SelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-button-select-all',
  templateUrl: './button-select-all.component.html',
  styleUrls: ['./button-select-all.component.scss']
})
export class ButtonSelectAllComponent implements OnInit {

  @Select(AppStore.getMenuActive)
  public menuActive$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;
  theme = Theme;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  selectAll() {
    let routePath = this.store.selectSnapshot(AppStore.isNote);
    if (routePath) {
      const noteType = this.store.selectSnapshot(AppStore.getRouting);
      this.store.dispatch(new SelectAllNote(noteType));
    }
    routePath = this.store.selectSnapshot(AppStore.isFolder);
    if (routePath) {
      const folderType = this.store.selectSnapshot(AppStore.getRouting);
      this.store.dispatch(new SelectAllFolder(folderType));
    }
  }

}
