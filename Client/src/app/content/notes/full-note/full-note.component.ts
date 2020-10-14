import { Component, OnInit, OnDestroy, Renderer2, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { SignalRService } from 'src/app/core/signal-r.service';
import { HubConnectionState } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import {LoadPrivateNotes, SelectIdNote,
  UnSelectIdNote,
  LoadArchiveNotes, LoadSharedNotes, LoadDeletedNotes, ClearUpdatelabelEvent, UnSelectAllNote
} from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/fullNote';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { UpdateText } from '../models/parts/updateText';
import {
  PersonalizationService,
  sideBarCloseOpen,
  deleteSmallNote,
  showHistory
} from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { SmallNote } from '../models/smallNote';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { UpdateRouteWithNoteType } from 'src/app/core/stateApp/app-action';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { LoadLabels } from '../../labels/state/labels-actions';
import { UpdateLabelEvent } from '../state/updateLabels';
import { NotesService } from '../notes.service';
import { FullNoteSliderService } from '../full-note-slider.service';
import { LoadFullNote, DeleteCurrentNote } from '../state/full-note-actions';
import { FullNoteStore } from '../state/full-note-state';
import { MurriService } from 'src/app/shared/services/murri.service';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss'],
  animations: [
    sideBarCloseOpen,
    deleteSmallNote,
    showHistory],
    providers: [NotesService]
})
export class FullNoteComponent implements OnInit, OnDestroy, AfterViewInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  destroy = new Subject<void>();

  @ViewChild('fullWrap') wrap: ElementRef;
  note: FullNote;
  theme = Theme;

  notes: number[] = [1, 2, 3, 4, 5, 6];
  turnUpNote = false;

  nameChanged: Subject<string> = new Subject<string>(); // CHANGE

  private firstInit = false;
  private routeSubscription: Subscription;
  private id: string;

  @Select(FullNoteStore.canView)
  public canView$: Observable<boolean>;

  @Select(FullNoteStore.canNoView)
  public canNoView$: Observable<boolean>;

  @Select(NoteStore.privateNotes)
  public notes$: Observable<SmallNote[]>;

  constructor(private signal: SignalRService,
              private route: ActivatedRoute,
              private store: Store,
              public pService: PersonalizationService,
              private rend: Renderer2,
              private noteService: NotesService,
              public sliderService: FullNoteSliderService,
              public murriService: MurriService) {
    this.routeSubscription = route.params.subscribe(params => this.id = params.id);
  }

  ngAfterViewInit(): void {
    if (this.note) {
    this.sliderService.goTo(this.sliderService.active, this.wrap);
    }
  }

  async ngOnInit() {

    this.store.dispatch(new UnSelectAllNote());

    this.pService.onResize();
    this.sliderService.rend = this.rend;
    this.sliderService.initWidthSlide();
    this.load();
    this.connectToHub();


    this.store.select(NoteStore.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.noteService.changeColorHandlerFullNote(this.note, x));

    this.nameChanged.pipe(
      debounceTime(50))
      .subscribe(html => this.signal.hubConnection.invoke('UpdateDocumentFromClient', this.initModel(html)));

    setTimeout(() => this.murriService.gridSettings('.grid-item-small'), 1000); // CHANGE TODO


    this.store.select(NoteStore.updateLabelEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe((values: UpdateLabelEvent[]) => {
        const value = values.find(x => x.id === this.id);
        if (value !== undefined) {
          this.note.labels = value.labels;
          this.store.dispatch(new ClearUpdatelabelEvent(this.note.id));
        }
      });
  }



  @HostListener('window:resize', ['$event'])
  sizeChange() {
    if (!this.note) {return; }
    if (!this.pService.check()) {
      this.sliderService.getSize();
    } else {
      this.sliderService.mainWidth = null;
      this.rend.setStyle(this.wrap.nativeElement, 'transform', 'translate3d( ' + 0 + '%,0,0)');
      this.sliderService.active = 0;
    }
  }

  panMove(e) {
    this.sliderService.panMove(e, this.wrap);
  }

  panEnd(e) {
    this.sliderService.panEnd(e, this.wrap);
  }



  deleteSmallNote(item: any) {
    let counter = 0;
    this.notes = this.notes.filter(x => x !== item);
    const interval = setInterval(() => {
      if (counter === 35) {
        clearInterval(interval);
      }
      this.murriService.grid.refreshItems().layout();
      counter++;
    }, 10);
  }

  turnUpSmallNote() {
    this.turnUpNote = !this.turnUpNote;
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

  // TODO Logic for updating on websockets
  initModel(html): UpdateText {
    return {
      rawHtml: html,
      noteId: this.id
    };
  }

  updateDoc(str: string) {
    const note = { ...this.note };
    note.title = str;
    // this.store.dispatch(new UpdateFullNote(note));
  }


  async load() { // TODO MAKE UNSUBSCRIBE
    await this.store.dispatch(new LoadFullNote(this.id)).toPromise();

    this.store.select(FullNoteStore.oneFull)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x) => {

        if (!x) {
          return;
        }

        this.note = {...x};
        console.log(5);

        if (!this.firstInit) {
          this.firstInit = true;
          this.store.dispatch(new UpdateRouteWithNoteType(EntityType.NoteInner, this.note.noteType));
          this.store.dispatch(new SelectIdNote(this.id, this.note.labels.map(z => z.id)));
          switch (this.note.noteType) {
            case NoteType.Private: {
              this.store.dispatch(new LoadPrivateNotes());
              break;
            }
            case NoteType.Archive: {
              this.store.dispatch(new LoadArchiveNotes());
              break;
            }
            case NoteType.Shared: {
              this.store.dispatch(new LoadSharedNotes());
              break;
            }
            case NoteType.Deleted: {
              this.store.dispatch(new LoadDeletedNotes());
              break;
            }
          }
        }
      });

    this.store.dispatch(new LoadLabels());
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
    this.murriService.flagForOpacity = false;
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
    this.store.dispatch(new DeleteCurrentNote());
    this.routeSubscription.unsubscribe();
    this.signal.hubConnection.invoke('LeaveNote', this.id);
  }
}
