import {
  Component,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { takeUntil } from 'rxjs/operators';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
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
import { SnackBarWrapperService } from '../../../shared/services/snackbar/snack-bar-wrapper.service';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss'],
  providers: [LabelsService],
})
export class AllComponent implements OnInit, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Select(LabelStore.countAll)
  countAll$: Observable<number>;

  fontSize = FontSizeENUM;

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public labelService: LabelsService,
    private sbws: SnackBarWrapperService,
    private translateService: TranslateService,
  ) {}

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.LabelPrivate)).toPromise();
    this.pService.setSpinnerState(true);
    await this.loadContent();
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

    this.pService.newButtonSubject
      .pipe(takeUntil(this.labelService.destroy))
      .subscribe(() => this.newLabel());
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
    const message =
      this.sbws.getLabelsNaming(false) +
      this.sbws.getMoveToMessage(false) +
      this.translateService.instant('snackBar.toBin');
    this.sbws.build(() => this.callBackOnDelete(label), message);
  }

  async callBackOnDelete(label: Label) {
    const callbackAction = new RestoreLabel(label);
    await this.store.dispatch(callbackAction).toPromise();
    this.labelService.entities.unshift(label);
  }
}
