import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { SmallNote } from '../models/smallNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UnSelectAllNote, LoadDeletedNotes, PositionNote, LoadAllExceptNotes } from '../state/notes-actions';
import { take, takeUntil } from 'rxjs/operators';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';
import { UpdateColor } from '../state/updateColor';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { UserStore } from 'src/app/core/stateUser/user-state';
import {  SpinnerChangeStatus, UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteStore } from '../state/notes-state';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [NotesService]
})
export class DeletedComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public noteService: NotesService) { }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NoteDeleted)).toPromise();
    await this.store.dispatch(new SpinnerChangeStatus(true)).toPromise();
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
    await this.store.dispatch(new LoadDeletedNotes()).toPromise();

    this.store.dispatch(new LoadAllExceptNotes(NoteType.Deleted));

    this.store.select(NoteStore.deletedNotes).pipe(take(1))
      .subscribe(async (x) => {
        this.noteService.firstInit(x);
        const active =  await this.pService.initPromise();
        await this.store.dispatch(new SpinnerChangeStatus(active)).toPromise()
        .then(z => { this.murriService.initMurriNote(EntityType.NoteDeleted); });
      });

  }


  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }

}
