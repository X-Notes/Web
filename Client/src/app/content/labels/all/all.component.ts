import { Component, OnInit, OnDestroy,  } from '@angular/core';
import { Subject } from 'rxjs';
import { Label } from '../models/label';
import { Store } from '@ngxs/store';
import { UpdateLabel, SetDeleteLabel, LoadLabels, AddLabel, } from '../state/labels-actions';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { take, takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import {  UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss'],
  providers: [MurriService]
})
export class AllComponent implements OnInit, OnDestroy  {

  fontSize = FontSize;
  public labels: Label[];

  destroy = new Subject<void>();

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public murriService: MurriService) { }

  async ngOnInit() {
    this.murriService.flagForOpacity = false;
    await this.store.dispatch(new UpdateRoute(EntityType.LabelPrivate)).toPromise();

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

    this.store.select(x => x.Labels.labelsAll).pipe(take(1))
    .subscribe(x => { this.labels = [...x];  setTimeout(() => this.murriService.initMurriLabel(false)); });

    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newLabel());
  }


  async update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  async newLabel() {
    await this.store.dispatch(new AddLabel()).toPromise();

    this.store.select(x => x.Labels.labelsAll).pipe(take(1))
    .subscribe(x => {
      this.labels.unshift(x[0]);
      setTimeout(() =>  this.murriService.grid.add(document.querySelector('.grid-item'), {index : 0, layout: true}), 0);
    });

  }

  async setDelete(label: Label) {
    await this.store.dispatch(new SetDeleteLabel(label)).toPromise();
    this.labels = this.labels.filter(x => x.id !== label.id);
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
