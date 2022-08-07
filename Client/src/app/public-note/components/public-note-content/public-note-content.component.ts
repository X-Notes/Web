import { Component, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NoteStore } from '../../../content/notes/state/notes-state';
import { Observable, Subject, Subscription } from 'rxjs';
import { FullNote } from '../../../content/notes/models/full-note.model';
import { ActivatedRoute } from '@angular/router';
import { DeleteCurrentNoteData, LoadFullNote } from '../../../content/notes/state/notes-actions';
import { PersonalizationService } from '../../../shared/services/personalization.service';
import { ContentModelBase } from '../../../content/notes/models/editor-models/content-model-base';
import { ApiServiceNotes } from '../../../content/notes/api-notes.service';

@Component({
  selector: 'app-public-note-content',
  templateUrl: './public-note-content.component.html',
  styleUrls: ['./public-note-content.component.scss'],
})
export class PublicNoteContentComponent implements OnDestroy {
  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  @Select(NoteStore.fullNoteTitle)
  noteTitle$: Observable<string>;

  @Select(NoteStore.canView)
  public canView$: Observable<boolean>;

  destroy = new Subject<void>();

  loaded = false;

  contents: ContentModelBase[];

  private routeSubscription: Subscription;

  constructor(
    route: ActivatedRoute,
    private store: Store,
    public pService: PersonalizationService,
    private api: ApiServiceNotes,
  ) {
    this.routeSubscription = route.params.subscribe(async (params) => {
      await this.loadMain(params.id);
      this.destroy.next();
      this.destroy.complete();
    });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new DeleteCurrentNoteData());
    this.routeSubscription.unsubscribe();
  }

  async loadMain(id: string) {
    await this.store.dispatch(new LoadFullNote(id)).toPromise();
    const isLocked = this.store.selectSnapshot(NoteStore.isLocked);
    console.log(isLocked);
    if (isLocked) {
      throw new Error('Need implementation');
    } else {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      console.log(note);
      if (!note) return;
      this.contents = await this.api.getContents(id).toPromise();
      this.loaded = true;
      this.note$.subscribe((nt) => {
        console.log(nt);
      });
    }
  }
}
