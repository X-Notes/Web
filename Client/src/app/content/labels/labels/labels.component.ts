import { Component, OnInit, OnDestroy } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../state/labels-state';
import { Observable, Subject } from 'rxjs';
import { Label } from '../models/label';
import { LoadLabels, AddLabel, DeleteLabel, UpdateLabel } from '../state/labels-actions';
import { takeUntil } from 'rxjs/operators';

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
export class LabelsComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();
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

    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newLabel());
  }

  async newLabel() {
    await this.store.dispatch(new AddLabel('', '#FFEBCD')).toPromise();
  }

  switchSub(value: subMenu) {
    this.current = value;
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

  update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  delete(id: number) {
    this.store.dispatch(new DeleteLabel(id));
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

}
