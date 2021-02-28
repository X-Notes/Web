import { Component, OnInit, OnDestroy, ViewChildren, AfterViewInit, ElementRef, QueryList } from '@angular/core';
import {  Store } from '@ngxs/store';
import { Label } from '../models/label';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { UpdateLabel, LoadLabels, DeleteLabel, RestoreLabel, SetDeleteLabel, } from '../state/labels-actions';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { LabelsService } from '../labels.service';
import { LabelStore } from '../state/labels-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { UserStore } from 'src/app/core/stateUser/user-state';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [LabelsService]
})
export class DeletedComponent implements OnInit, OnDestroy, AfterViewInit {

  fontSize = FontSize;
  destroy = new Subject<void>();
  loaded = false;
  @ViewChildren('item', { read: ElementRef,  }) refElements: QueryList<ElementRef>;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public labelService: LabelsService,
              private snackService: SnackbarService) { }


  ngAfterViewInit(): void {
    this.labelService.murriInitialise(this.refElements, true);
  }


  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.LabelDeleted)).toPromise();

    this.store.select(AppStore.getTokenUpdated)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (x: boolean) => {
      if (x) {
        await this.loadContent();
      }
    }
    );

  }

  async loadContent() {
    this.pService.setSpinnerState(true);
    await this.store.dispatch(new LoadLabels()).toPromise();

    const labels = this.store.selectSnapshot(LabelStore.deleted);
    this.labelService.firstInit(labels);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;

    this.store.select(LabelStore.deleted)
    .pipe(takeUntil(this.destroy))
    .subscribe(labs => {
      if (labs.length === 0) {
        this.labelService.labels = [];
        setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
      }
    });
  }


  update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  restoreLabel(label: Label) {
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    this.labelService.labels = this.labelService.labels.filter(x => x.id !== label.id);
    let snackbarRef;
    switch (language) {
      case 'English':
        snackbarRef = this.snackService.openSnackBar(`Label moved to bin`, 'Undo');
        break;
      case 'Russian':
        snackbarRef = this.snackService.openSnackBar(`Ярлык перенесен в корзину`, 'Отменить');
        break;
      case 'Ukraine':
        snackbarRef = this.snackService.openSnackBar(`Ярлик пересений в кошик`, 'Відмінити');
        break;
    }
    snackbarRef.afterDismissed().subscribe(x => {
      if (x.dismissedByAction) {
        this.store.dispatch(new SetDeleteLabel(label));
      }
    });
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

  async delete(label: Label) {
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    await this.store.dispatch(new DeleteLabel(label)).toPromise();
    this.labelService.labels = this.labelService.labels.filter(x => x.id !== label.id);
    let snackbarRef;
    switch (language) {
      case 'English':
        snackbarRef = this.snackService.openSnackBar(`Label deleted permanently`, null);
        break;
      case 'Russian':
        snackbarRef = this.snackService.openSnackBar(`Ярлык удален безвозвратно`, null);
        break;
      case 'Ukraine':
        snackbarRef = this.snackService.openSnackBar(`Ярлык удален безповоротно`, null);
        break;
    }
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

}
