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
import { takeUntil } from 'rxjs/operators';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { LabelStore } from '../state/labels-state';
import { LabelsService } from '../labels.service';
import {
  UpdateLabel,
  LoadLabels,
  DeleteLabel,
  SetDeleteLabel,
  RestoreLabel,
} from '../state/labels-actions';
import { Label } from '../models/label.model';
import { SnackBarWrapperService } from '../../navigation/snack-bar-wrapper.service';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [LabelsService],
})
export class DeletedComponent implements OnInit, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  fontSize = FontSizeENUM;

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public labelService: LabelsService,
    private sbws: SnackBarWrapperService,
  ) {}

  ngAfterViewInit(): void {
    this.labelService.murriInitialise(this.refElements, true);
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.LabelDeleted)).toPromise();
    this.pService.setSpinnerState(true);
    this.pService.setIllustrationState(false);

    this.store
      .select(AppStore.appLoaded)
      .pipe(takeUntil(this.labelService.destroy))
      .subscribe(async (x: boolean) => {
        if (x) {
          await this.loadContent();
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
      .select(LabelStore.countDeleted)
      .pipe(takeUntil(this.labelService.destroy))
      .subscribe((x) => {
        if (!x) {
          this.pService.setIllustrationState(true);
        }
      });

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
    this.sbws.buildLabel(
      () => this.callBackOnRestore(label),
      this.sbws.getLabelsNaming,
      this.sbws.getAllLabelsEntityName,
      false,
    );
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
