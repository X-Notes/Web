import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-button-question',
  templateUrl: './button-question.component.html',
  styleUrls: ['./button-question.component.scss']
})
export class ButtonQuestionComponent implements OnInit {


  @Select(FolderStore.activeMenu)
  public menuActiveFolders$: Observable<boolean>;

  @Select(NoteStore.activeMenu)
  public menuActiveNotes$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;
  theme = Theme;

  constructor() { }

  ngOnInit(): void {
  }

}
