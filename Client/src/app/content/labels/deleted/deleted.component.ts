import { Component, OnInit, OnDestroy, ViewChildren, AfterViewInit, ElementRef, QueryList } from '@angular/core';
import {  Store } from '@ngxs/store';
import { Label } from '../models/label';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { UpdateLabel, LoadLabels, DeleteLabel, } from '../state/labels-actions';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { MurriService } from 'src/app/shared/services/murri.service';
import { LabelsService } from '../labels.service';
import { LabelStore } from '../state/labels-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeNaming } from 'src/app/shared/enums/FontSizeEnum';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [LabelsService]
})
export class DeletedComponent implements OnInit, OnDestroy, AfterViewInit {

  fontSize = FontSizeNaming;
  destroy = new Subject<void>();
  loaded = false;
  @ViewChildren('item', { read: ElementRef,  }) refElements: QueryList<ElementRef>;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public labelService: LabelsService) { }


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

    this.store.select(AppStore.appLoaded)
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
    this.labelService.labels = this.labelService.labels.filter(x => x.id !== label.id);
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

  async delete(label: Label) {
    await this.store.dispatch(new DeleteLabel(label)).toPromise();
    this.labelService.labels = this.labelService.labels.filter(x => x.id !== label.id);
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

}
