import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../dialog_data';
import { EnumUtil } from '../../services/enum.util';
import { NoteColorPallete } from '../../enums/NoteColors';
import { LabelsColor } from '../../enums/LabelsColors';
import { PersonalizationService } from '../../services/personalization.service';
import { Theme } from '../../enums/Theme';
import { Store, Select } from '@ngxs/store';
import { ChangeColorNote } from 'src/app/content/notes/state/notes-actions';
import { NoteType } from '../../enums/NoteTypes';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs/internal/Observable';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { RoutePathes } from '../../enums/RoutePathes';

@Component({
  selector: 'app-change-color',
  templateUrl: './change-color.component.html',
  styleUrls: ['./change-color.component.scss']
})
export class ChangeColorComponent implements OnInit {

  @Select(AppStore.getRoutePath)
  public pathType$: Observable<RoutePathes>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  pallete = EnumUtil.getEnumValues(NoteColorPallete);
  current;
  theme = Theme;
  routePath = RoutePathes;
  date: Date;
  constructor(public dialogRef: MatDialogRef<ChangeColorComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              public pService: PersonalizationService,
              private store: Store, ) { }

  ngOnInit(): void {
    this.date = new Date();
    this.current = this.pallete[0];
  }

  changeCurrent(color: string) {
    this.current = color;
  }

  async changeColor() { // TODO
    // await this.store.dispatch(new ChangeColorNote(this.current, NoteType.Private)).toPromise();
    this.dialogRef.close();
  }
}
