import {
  Component,
  OnInit,
  ViewChildren,
  AfterViewInit,
  ElementRef,
  QueryList,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { take, takeUntil } from 'rxjs/operators';
import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LabelStore } from '../state/labels-state';
import { LabelsService } from '../labels.service';
import {
  UpdateLabel,
  LoadLabels,
  DeleteLabel,
  SetDeleteLabel,
  RestoreLabel,
  DeleteAllLabelsFromBin,
} from '../state/labels-actions';
import { Label } from '../models/label.model';
import { SnackBarWrapperService } from '../../../shared/services/snackbar/snack-bar-wrapper.service';
import { DialogsManageService } from '../../navigation/services/dialogs-manage.service';
import { UserStore } from 'src/app/core/stateUser/user-state';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [LabelsService],
})
export class DeletedComponent implements OnInit, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Select(UserStore.getUserFontSize)
  public fontSize$?: Observable<EntitiesSizeENUM>;
  
  @Select(LabelStore.countDeleted)
  countDeleted$: Observable<number>;

  fontSize = EntitiesSizeENUM;

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public labelService: LabelsService,
    private sbws: SnackBarWrapperService,
    private translateService: TranslateService,
    private dialogsService: DialogsManageService,
  ) {}

  ngAfterViewInit(): void {
    this.labelService.murriInitialise(this.refElements);
  }

  async ngOnInit() {
    this.pService.setSpinnerState(true);
    await this.loadContent();

    this.pService.emptyTrashButtonSubject
      .pipe(takeUntil(this.labelService.destroy))
      .subscribe(async (flag) => {
        if (flag) {
          const instance = this.dialogsService.openDeletionPopup(
            'modal.deletionModal.sureDeleteLabels',
            'modal.deletionModal.additionalMessage',
          );
          instance
            .afterClosed()
            .pipe(take(1))
            .subscribe((x) => {
              if (x) {
                this.store.dispatch(DeleteAllLabelsFromBin);
              }
            });
        }
      });
  }

  async loadContent() {
    await this.store.dispatch(new LoadLabels()).toPromise();

    const labels = this.store.selectSnapshot(LabelStore.deleted);
    this.labelService.initializeEntities(labels);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;

    this.store
      .select(LabelStore.deleted)
      .pipe(takeUntil(this.labelService.destroy))
      .subscribe((labs) => {
        if (labs.length === 0) {
          this.labelService.entities = [];
        }
      });
  }

  update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  async restoreLabel(label: Label) {
    await this.store.dispatch(new RestoreLabel(label)).toPromise();

    this.labelService.entities = this.labelService.entities.filter((x) => x.id !== label.id);
    const message =
      this.sbws.getLabelsNaming(false) +
      this.sbws.getMoveToMessage(false) +
      this.translateService.instant('snackBar.all');
    this.sbws.build(() => this.callBackOnRestore(label), message);
  }

  async callBackOnRestore(label: Label) {
    const callbackAction = new SetDeleteLabel(label);
    await this.store.dispatch(callbackAction).toPromise();
    this.labelService.entities.unshift(label);
  }

  async delete(label: Label) {
    await this.store.dispatch(new DeleteLabel(label)).toPromise();
    this.labelService.entities = this.labelService.entities.filter((x) => x.id !== label.id);
  }
}
