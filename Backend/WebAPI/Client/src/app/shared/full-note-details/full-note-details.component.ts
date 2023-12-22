import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { EditorElementsCount } from 'src/app/core/models/editor/editor-elements.count';
import { AppStore } from 'src/app/core/stateApp/app-state';

@Component({
  selector: 'app-full-note-details',
  templateUrl: './full-note-details.component.html',
  styleUrls: ['./full-note-details.component.scss']
})
export class FullNoteDetailsComponent {

  @Select(AppStore.getEditorElementCount)
  public editorElementsCount$: Observable<EditorElementsCount>;

  @Select(AppStore.getEditorSyncing)
  public editorSyncing$: Observable<boolean>;

  constructor() {

  }
}
