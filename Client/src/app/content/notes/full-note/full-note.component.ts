import { Component, OnInit, OnDestroy } from '@angular/core';
import { SignalRService } from 'src/app/core/signal-r.service';
import { HubConnectionState } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { LoadFullNote, UpdateFullNote, LoadPrivateNotes } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/fullNote';
import { take, map, mergeMap, debounceTime } from 'rxjs/operators';
import { UpdateText } from '../models/parts/updateText';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { SmallNote } from '../models/smallNote';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss'],
  animations: [ sideBarCloseOpen ]
})
export class FullNoteComponent implements OnInit, OnDestroy {

  note: FullNote;
  theme = Theme;

  nameChanged: Subject<string> = new Subject<string>(); // CHANGE

  private routeSubscription: Subscription;
  private id: string;

  @Select(NoteStore.privateNotes)
  public notes$: Observable<SmallNote[]>;

  constructor(private signal: SignalRService,
              private route: ActivatedRoute,
              private store: Store,
              public pService: PersonalizationService) {
              this.routeSubscription = route.params.subscribe(params => this.id = params.id);
            }

  async ngOnInit() {
    this.pService.onResize();
    this.load();
    this.connectToHub();

    await this.store.dispatch(new LoadPrivateNotes()).toPromise();

    this.nameChanged.pipe(
      debounceTime(50))
      .subscribe(html => this.signal.hubConnection.invoke('UpdateDocumentFromClient', this.initModel(html)));
  }

  // TODO Logic for updating on websockets
  initModel(html): UpdateText {
    return {
      rawHtml: html,
      noteId: this.id
    };
  }

  updateDoc(str: string) {
    const note = {...this.note};
    note.title = str;
    this.store.dispatch(new UpdateFullNote(note));
  }


  async load() { // TODO MAKE UNSUBSCRIBE
    await this.store.dispatch(new LoadFullNote(this.id)).toPromise();
    this.store.select(NoteStore.oneFull)
    .pipe(map(func => func(this.id)))
    .subscribe(x => {this.note = x; });
  }

  connectToHub() {
    if (this.signal.hubConnection.state === HubConnectionState.Connected) {
    this.signal.hubConnection.invoke('JoinNote', this.id);
    this.signal.hubConnection.on('updateDoc', (str) => this.updateDoc(str));
    } else {
      setTimeout(() => this.connectToHub(), 100);
    }
  }

  // EDITING DOCUMENT

  onInput($event) {
    this.nameChanged.next($event.target.innerHTML);
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.signal.hubConnection.invoke('LeaveNote', this.id);
  }
}
