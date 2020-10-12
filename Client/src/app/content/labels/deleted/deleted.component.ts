import { Component, OnInit, OnDestroy } from '@angular/core';
import {  Store } from '@ngxs/store';
import { Label } from '../models/label';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { UpdateLabel, LoadLabels, DeleteLabel, PositionLabel } from '../state/labels-actions';
import { take, takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Subject } from 'rxjs';
import {UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [MurriService]
})
export class DeletedComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  public labels: Label[];
  destroy = new Subject<void>();

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    this.murriService.flagForOpacity = false;
    await this.store.dispatch(new UpdateRoute(EntityType.LabelDeleted)).toPromise();

    this.store.select(UserStore.getTokenUpdated)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (x: boolean) => {
      if (x) {
        await this.loadContent();
      }
    }
    );

  }

  async loadContent() {
    await this.store.dispatch(new LoadLabels()).toPromise();

    this.store.select(x => x.Labels.labelsDeleted).pipe(take(1))
    .subscribe(x => { this.labels = x; setTimeout(() => this.murriService.initMurriLabel(true)); });
  }


  update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  restoreLabel(label: Label) {
    this.labels = this.labels.filter(x => x.id !== label.id);
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

  async delete(label: Label) {
    await this.store.dispatch(new DeleteLabel(label)).toPromise();
    this.labels = this.labels.filter(x => x.id !== label.id);
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

}
