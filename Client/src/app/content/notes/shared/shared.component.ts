import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { SmallNote } from '../models/smallNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UnSelectAllNote, LoadSharedNotes, PositionNote, LoadAllExceptNotes } from '../state/notes-actions';
import { take, takeUntil } from 'rxjs/operators';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';
import { UpdateColor } from '../state/updateColor';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteStore } from '../state/notes-state';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();


  constructor(public pService: PersonalizationService,
              private store: Store,
              private murriService: MurriService,
              public noteService: NotesService
  ) { }

  async ngOnInit() {

    await this.store.dispatch(new UpdateRoute(EntityType.NoteShared)).toPromise();

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
    await this.store.dispatch(new LoadSharedNotes()).toPromise();

    this.store.dispatch(new LoadAllExceptNotes(NoteType.Shared));

    this.store.select(NoteStore.sharedNotes).pipe(take(1))
    .subscribe(x => { this.pService.spinner = false;
                      this.noteService.notes = [...x].map(note => { note = { ...note }; return note; });
                      setTimeout(() => this.murriService.initMurriNote(EntityType.NoteShared)); });

  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }


}
