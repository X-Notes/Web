import {
  Component, OnInit, OnDestroy,
  Renderer2, ViewChild, ElementRef, HostListener, AfterViewInit} from '@angular/core';
import { SignalRService } from 'src/app/core/signal-r.service';
import { HubConnectionState } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { DeleteCurrentNote, LoadAllNotes, LoadFullNote, UpdateTitle } from '../state/notes-actions';
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
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { LoadLabels } from '../../labels/state/labels-actions';
import { NotesService } from '../notes.service';
import { FullNoteSliderService } from '../full-note-slider.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';


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

  destroy = new Subject<void>();

  @ViewChild('fullWrap') wrap: ElementRef;

  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  theme = Theme;

  notes: number[] = [0, 1, 2, 3, 4, 5];

  nameChanged: Subject<string> = new Subject<string>(); // CHANGE

  private routeSubscription: Subscription;
  private id: string;

  @Select(NoteStore.canView)
  public canView$: Observable<boolean>;

  @Select(NoteStore.canNoView)
  public canNoView$: Observable<boolean>;

  public notesLink: SmallNote[];

  constructor(private signal: SignalRService,
              private route: ActivatedRoute,
              private store: Store,
              public pService: PersonalizationService,
              private rend: Renderer2,
              public sliderService: FullNoteSliderService,
              public murriService: MurriService) {
    this.routeSubscription = route.params.subscribe(async (params) => {
      this.id = params.id;

      this.store.select(AppStore.getTokenUpdated)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x: boolean) => {
        if (x) {
          await this.initNote();
          this.store.dispatch(new LoadLabels());
        }
      }
      );
    });

  }


  ngAfterViewInit(): void {
    const note = this.store.selectSnapshot(NoteStore.oneFull);
    if (note) {
      this.sliderService.goTo(this.sliderService.active, this.wrap);
    }
  }

  async initNote() {
    if (this.signal.hubConnection.state === HubConnectionState.Connected) {
      this.signal.hubConnection.invoke('LeaveNote', this.id);
    }
    await this.LoadMain();
    await this.LoadSecond();
    this.connectToHub();
  }

  async LoadMain() {
    await this.store.dispatch(new LoadFullNote(this.id)).toPromise();
  }

  async LoadSecond() {
    await this.store.dispatch(new LoadAllNotes()).toPromise();
    this.store.select(NoteStore.oneFull)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (note) => {
      if (note) {
        await this.setSideBarNotes(note.noteType);
      }
    });

  }

  async ngOnInit() {
    this.store.dispatch(new UpdateRoute(EntityType.NoteInner));
    this.pService.onResize();
    this.sliderService.rend = this.rend;
    this.sliderService.initWidthSlide();

    this.nameChanged.pipe(
      takeUntil(this.destroy),
      debounceTime(50))
      .subscribe(title => this.store.dispatch(new UpdateTitle(title)));

    setTimeout(() => this.murriService.gridSettings('.grid-item-small',
      document.querySelector('.grid') as HTMLElement, true), 3000); // CHANGE TODO
    setTimeout(async () => this.murriService.setOpacityTrueAsync(), 1500); // CHANGE TODO

  }



  @HostListener('window:resize', ['$event'])
  sizeChange() {
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
    this.notes = this.notes.filter(x => x !== this.notes[item]);
    const interval = setInterval(() => {
      if (counter === 35) {
        clearInterval(interval);
      }
      this.murriService.grid.refreshItems().layout();
      counter++;
    }, 10);
  }

  // TODO Logic for updating on websockets
  initModel(html): UpdateText {
    return {
      rawHtml: html,
      noteId: this.id
    };
  }

  updateDoc(str: string) {
    // TODO
    // const note = { ...this.note };
    // note.title = str;
    // this.store.dispatch(new UpdateFullNote(note));
  }



  setSideBarNotes(noteType: NoteType) {
    let notes: SmallNote[];
    switch (noteType) {
      case NoteType.Deleted: {
        notes = this.store.selectSnapshot(NoteStore.deletedNotes);
        break;
      }
      case NoteType.Private: {
        notes = this.store.selectSnapshot(NoteStore.privateNotes);
        break;
      }
      case NoteType.Shared: {
        notes = this.store.selectSnapshot(NoteStore.sharedNotes);
        break;
      }
      case NoteType.Archive: {
        notes = this.store.selectSnapshot(NoteStore.archiveNotes);
        break;
      }
    }
    this.notesLink = notes.filter(z => z.id !== this.id);
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

  pasteCommandHandler(e) {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new DeleteCurrentNote());
    this.routeSubscription.unsubscribe();
    this.signal.hubConnection.invoke('LeaveNote', this.id);
  }

}
