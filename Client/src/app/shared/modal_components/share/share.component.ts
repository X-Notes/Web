import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { merge, Observable } from 'rxjs';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
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
  isCollapse = true;
  isAccess = true;
  isManyNotes = false;
  tooltipPos = '';

  deleteThis = ["hello","hello","hello","hello","hello","hello","hello","hello","hello","hello","hello","hello","hello","hello","hello"];

  @ViewChild('overlay') overlay: ElementRef;
  @ViewChild('overlay2') overlay2: ElementRef;
  @ViewChild('tabs', {static: false}) tabs;


  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public pService: PersonalizationService,
    private rend: Renderer2,
    private store: Store) { }

  ngOnInit(): void {
    merge(
      this.store.select(NoteStore.selectedCount),
      this.store.select(FolderStore.selectedCount)
    )
    .subscribe(x => {
      if(x === 0) {
        return;
      }
      else if (x >= 2) {
        this.isManyNotes = true;
      } else {
        this.isManyNotes = false;
      }
    });

    this.tooltipPos = this.changeTooltipPos();
  }

  changeActive() {
    this.dropdownActive = !this.dropdownActive;
    if (this.dropdownActive) {
      this.rend.setStyle(this.overlay.nativeElement, 'display', 'block');
      this.rend.setStyle(this.overlay2.nativeElement, 'display', 'block');
    } else {
      this.rend.setStyle(this.overlay.nativeElement, 'display', 'none');
      this.rend.setStyle(this.overlay2.nativeElement, 'display', 'none');

    }
  }

  changeAccess(): void {
    this.isAccess = !this.isAccess;
  }

  setLanguage(item: any): void  {
    switch (item) {
      case 'Private':
        console.log('private');
        break;
      case 'Shared':
        console.log('shared');
        break;
    }
  }

  cancelDropdown() {
    this.dropdownActive = true;
    this.rend.setStyle(this.overlay.nativeElement, 'display', 'none');
    this.rend.setStyle(this.overlay2.nativeElement, 'display', 'none');
  }

  collapseToggle() {
    this.isCollapse = !this.isCollapse;
    setTimeout(() => {
      this.tabs.realignInkBar();
    }, 150);
  }

  disableTooltipUser():boolean {
    if (this.isCollapse) {
      return false;
    } else {
      return true;
    }
  }

  changeTooltipPos():string {
    if(this.pService.check()) {
      return "Right";
    } else {
      return "Top";
    }
  }

}
