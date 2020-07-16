import { Component, OnInit, OnDestroy } from '@angular/core';
import { SignalRService } from 'src/app/core/signal-r.service';
import { HubConnectionState } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { LoadFullNote } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/fullNote';
import { take, map, mergeMap, debounceTime } from 'rxjs/operators';
import { UpdateText } from '../models/parts/updateText';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss']
})
export class FullNoteComponent implements OnInit, OnDestroy {

  note: FullNote;

  nameChanged: Subject<string> = new Subject<string>(); // CHANGE

  private routeSubscription: Subscription;
  private id: string;

  constructor(private signal: SignalRService, private route: ActivatedRoute, private store: Store) {
              this.routeSubscription = route.params.subscribe(params => this.id = params.id);
            }

  ngOnInit(): void {
    this.load();
    this.connectToHub();

    this.nameChanged.pipe(
      debounceTime(50))
      .subscribe(html => this.signal.hubConnection.invoke('UpdateDocumentFromClient', this.initModel(html)));
  }

  // Logic for updating on websockets
  initModel(html): UpdateText {
    return {
      rawHtml: html,
      noteId: this.id
    };
  }

  updateDoc(str: string) {
    this.note.title = str;
  }


  async load() {
    await this.store.dispatch(new LoadFullNote(this.id)).toPromise();
    this.store.select(NoteStore.oneFull)
    .pipe(take(1), map(func => func(this.id)))
    .subscribe(x => this.note = x);
  }

  connectToHub() {
    if (this.signal.hubConnection.state === HubConnectionState.Connected) {
    this.signal.hubConnection.invoke('JoinNote', this.id);
    this.signal.hubConnection.on('updateDoc', this.updateDoc);
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
