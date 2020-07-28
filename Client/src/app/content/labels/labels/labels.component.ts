import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../state/labels-state';
import { Observable, Subject } from 'rxjs';
import { Label } from '../models/label';
import { LoadLabels, AddLabel, DeleteLabel, UpdateLabel, PositionLabel } from '../state/labels-actions';
import { takeUntil } from 'rxjs/operators';
import Grid, * as Muuri from 'muuri';

export enum subMenu {
  All = 'all',
  Bin = 'bin'
}

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  animations: [ sideBarCloseOpen ],
})
export class LabelsComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();
  current: subMenu;
  menu = subMenu;
  theme = Theme;

  @Select(LabelStore.all)
  public labels$: Observable<Label[]>;

  constructor(public pService: PersonalizationService,
              private store: Store) {}


  async ngOnInit() {
    this.pService.onResize();
    this.current = subMenu.All;

    await this.store.dispatch(new LoadLabels()).toPromise();

    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newLabel());

    this.pService.gridSettings();

    this.pService.grid.on('dragEnd', (item, event) => {
        console.log(event);
        console.log(item);
        console.log(item.getGrid().getItems().indexOf(item));
      });
  }

  async newLabel() {
    await this.store.dispatch(new AddLabel('', '#FFEBCD')).toPromise();
    this.pService.grid.add(document.querySelector('.grid-item'), {index : 0, layout: true});
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

  async delete(id: number) {
    await this.store.dispatch(new DeleteLabel(id)).toPromise();
    this.pService.grid.refreshItems().layout();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
