import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  AfterViewInit,
  ElementRef,
  QueryList,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { MurriService } from 'src/app/shared/services/murri.service';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeENUM } from 'src/app/shared/enums/FontSizeEnum';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { LanguagesENUM } from 'src/app/shared/enums/LanguagesENUM';
import { LabelStore } from '../state/labels-state';
import { LabelsService } from '../labels.service';
import { UpdateLabel, LoadLabels, DeleteLabel, SetDeleteLabel } from '../state/labels-actions';
import { Label } from '../models/label';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [LabelsService],
})
export class DeletedComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  fontSize = FontSizeENUM;

  destroy = new Subject<void>();

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public murriService: MurriService,
    public labelService: LabelsService,
    private snackService: SnackbarService,
  ) {}

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
    this.pService.setSpinnerState(true);
    this.pService.setIllustrationState(false);

    this.store
      .select(AppStore.appLoaded)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x: boolean) => {
        if (x) {
          await this.loadContent();
        }
      });
  }

  async loadContent() {
    await this.store.dispatch(new LoadLabels()).toPromise();

    const labels = this.store.selectSnapshot(LabelStore.deleted);
    this.labelService.firstInit(labels);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;

    this.store
      .select(LabelStore.countDeleted)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
        if (!x) {
          this.pService.setIllustrationState(true);
        }
      });

    this.store
      .select(LabelStore.deleted)
      .pipe(takeUntil(this.destroy))
      .subscribe((labs) => {
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
    // TODO CHANGE
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    this.labelService.labels = this.labelService.labels.filter((x) => x.id !== label.id);
    let snackbarRef;
    switch (language) {
      case LanguagesENUM.English:
        snackbarRef = this.snackService.openSnackBar(`Label moved to bin`, 'Undo');
        break;
      case LanguagesENUM.Russian:
        snackbarRef = this.snackService.openSnackBar(`Ярлык перенесен в корзину`, 'Отменить');
        break;
      case LanguagesENUM.Ukraine:
        snackbarRef = this.snackService.openSnackBar(`Ярлик пересений в кошик`, 'Відмінити');
        break;
      default:
        throw new Error('error');
    }
    snackbarRef
      .afterDismissed()
      .pipe(take(1))
      .subscribe((x) => {
        if (x.dismissedByAction) {
          this.store.dispatch(new SetDeleteLabel(label));
        }
      });
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

  async delete(label: Label) {
    // TODO CHANGE
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    await this.store.dispatch(new DeleteLabel(label)).toPromise();
    this.labelService.labels = this.labelService.labels.filter((x) => x.id !== label.id);
    let snackbarRef;
    switch (language) {
      case LanguagesENUM.English:
        snackbarRef = this.snackService.openSnackBar(`Label deleted permanently`, null);
        break;
      case LanguagesENUM.Russian:
        snackbarRef = this.snackService.openSnackBar(`Ярлык удален безвозвратно`, null);
        break;
      case LanguagesENUM.Ukraine:
        snackbarRef = this.snackService.openSnackBar(`Ярлык удален безповоротно`, null);
        break;
      default:
        throw new Error('error');
    }
    snackbarRef
      .afterDismissed()
      .pipe(take(1))
      .subscribe((x) => {
        if (x.dismissedByAction) {
          this.store.dispatch(new SetDeleteLabel(label));
        }
      });
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }
}
