import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChangeLanguage } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Language } from '../../enums/Language';
import { Theme } from '../../enums/Theme';
import { EnumUtil } from '../../services/enum.util';
import { PersonalizationService, showHistory } from '../../services/personalization.service';
import { DialogData } from '../dialog_data';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  animations: [ showHistory ]
})
export class ShareComponent implements OnInit {

  dropdownActive = false;

  @ViewChild('overlay') overlay: ElementRef;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public pService: PersonalizationService,
    ) { }

  ngOnInit(): void {

  }

  changeActive() {
    this.dropdownActive = !this.dropdownActive;
  }


}
