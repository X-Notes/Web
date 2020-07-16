import { Component, OnInit, OnDestroy } from '@angular/core';
import { SignalRService } from 'src/app/core/signal-r.service';
import { HubConnectionState } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { LoadFullNote } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/fullNote';
import { take, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss']
})
export class FullNoteComponent implements OnInit, OnDestroy {

  note: FullNote;

  private routeSubscription: Subscription;
  private id: string;

  constructor(private signal: SignalRService, private route: ActivatedRoute, private store: Store) {
              this.routeSubscription = route.params.subscribe(params => this.id = params.id);
            }

  ngOnInit(): void {
    this.load();
    this.connectToHub();
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
    } else {
      setTimeout(() => this.connectToHub(), 100);
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.signal.hubConnection.invoke('LeaveNote', this.id);
  }
}
