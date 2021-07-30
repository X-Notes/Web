import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  ElementRef,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { takeUntil } from 'rxjs/operators';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { MurriService } from 'src/app/shared/services/murri.service';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { LabelsService } from '../labels.service';
import { LabelStore } from '../state/labels-state';
import {
  UpdateLabel,
  SetDeleteLabel,
  LoadLabels,
  AddLabel,
  RestoreLabel,
} from '../state/labels-actions';
import { Label } from '../models/label.model';
import { SnackBarWrapperService } from '../../navigation/snack-bar-wrapper.service';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss'],
  providers: [LabelsService],
})
export class AllComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  fontSize = FontSizeENUM;

  destroy = new Subject<void>();

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public murriService: MurriService,
    public labelService: LabelsService,
    private sbws: SnackBarWrapperService,
  ) {}

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.LabelPrivate)).toPromise();
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

  ngAfterViewInit(): void {
    this.labelService.murriInitialise(this.refElements, false);
  }

  async loadContent() {
    await this.store.dispatch(new LoadLabels()).toPromise();

    const labels = this.store.selectSnapshot(LabelStore.all);
    this.labelService.initializeEntities(labels);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;

    this.store
      .select(LabelStore.countAll)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
        if (!x) {
          this.pService.setSpinnerState(false);
          this.pService.setIllustrationState(true);
        }
      });

    this.pService.newButtonSubject.pipe(takeUntil(this.destroy)).subscribe(() => this.newLabel());
  }

  async update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  async newLabel() {
    await this.store.dispatch(new AddLabel()).toPromise();

    const labels = this.store.selectSnapshot(LabelStore.all);
    this.labelService.entities.unshift(labels[0]);
  }

  async setDelete(label: Label) {
    await this.store.dispatch(new SetDeleteLabel(label)).toPromise();
    this.labelService.entities = this.labelService.entities.filter((x) => x.id !== label.id);

    this.sbws.buildLabel(
      () => this.callBackOnDelete(label),
      this.sbws.getLabelsNaming,
      this.sbws.getAllLabelsEntityName,
      false,
    );
  }

  async callBackOnDelete(label: Label) {
    const callbackAction = new RestoreLabel(label);
    await this.store.dispatch(callbackAction).toPromise();
    this.labelService.entities.unshift(label);
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
  }
}
