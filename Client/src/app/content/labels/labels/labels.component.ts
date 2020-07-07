import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../state/labels-state';
import { Observable } from 'rxjs';
import { Label } from '../models/label';
import { LoadLabels } from '../state/labels-actions';

export enum subMenu {
  All = 'all',
  Bin = 'bin'
}

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  animations: [ sideBarCloseOpen ]
})
export class LabelsComponent implements OnInit {

  current: subMenu;
  menu = subMenu;
  theme = Theme;

  @Select(LabelStore.all)
  public labels$: Observable<Label[]>;

  constructor(public pService: PersonalizationService,
              private store: Store) { }

  ngOnInit(): void {
    this.current = subMenu.All;
    this.store.dispatch(new LoadLabels());
  }

  switchSub(value: subMenu) {
    this.current = value;
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

}
