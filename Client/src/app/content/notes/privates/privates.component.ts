import { Component, OnInit, OnDestroy } from '@angular/core';
import { NoteStore } from '../state/notes-state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { SmallNote } from '../models/smallNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { takeUntil, take } from 'rxjs/operators';
import { AddNote, LoadPrivateNotes } from '../state/notes-actions';
import { Router } from '@angular/router';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';

@Component({
  selector: 'app-privates',
  templateUrl: './privates.component.html',
  styleUrls: ['./privates.component.scss']
})
export class PrivatesComponent implements OnInit {

  public notes: SmallNote[];

  constructor(public pService: PersonalizationService,
              private store: Store
    ) { }

  async ngOnInit() {
    await this.store.dispatch(new LoadPrivateNotes()).toPromise();

    this.store.select(x => x.Notes.privateNotes).pipe(take(1))
    .subscribe(x => { this.notes = [...x]; setTimeout(() => this.initMurri()); });
  }

  initMurri() {
    this.pService.gridSettings();

    this.pService.grid.on('dragEnd', async (item, event) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Note,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      });
  }
}
