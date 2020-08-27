import { Component, OnInit, OnDestroy, Renderer2, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { SignalRService } from 'src/app/core/signal-r.service';
import { HubConnectionState } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { LoadFullNote, UpdateFullNote, LoadPrivateNotes, SelectIdNote, UnSelectIdNote, LoadAllExceptNotes } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/fullNote';
import { take, map, mergeMap, debounceTime, filter, takeUntil } from 'rxjs/operators';
import { UpdateText } from '../models/parts/updateText';
import {
  PersonalizationService,
  sideBarCloseOpen,
  deleteSmallNote,
  showHistory } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { SmallNote } from '../models/smallNote';
import { AnimationBuilder, animate, style } from '@angular/animations';
import { UserStore } from 'src/app/core/stateUser/user-state';
import {  UpdateRoute } from 'src/app/core/stateApp/app-action';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { MenuButtonsService } from '../../navigation/menu-buttons.service';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { UpdateColor } from '../state/updateColor';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss'],
  animations: [
    sideBarCloseOpen,
    deleteSmallNote,
    showHistory ]
})
export class FullNoteComponent implements OnInit, OnDestroy, AfterViewInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  destroy = new Subject<void>();

  @ViewChild('fullWrap') wrap: ElementRef;
  mainWidth = 0;
  public perc: number;
  public player;
  public pos: number;
  private animating = false;
  private animFactory: any;
  active = 0;
  total = 2;
  animMS = 700;
  helper: Element;
  note: FullNote;
  theme = Theme;

  notes: number[] = [1, 2, 3, 4, 5, 6];
  turnUpNote = false;

  nameChanged: Subject<string> = new Subject<string>(); // CHANGE

  private routeSubscription: Subscription;
  private id: string;

  @Select(NoteStore.privateNotes)
  public notes$: Observable<SmallNote[]>;

  constructor(private signal: SignalRService,
              private route: ActivatedRoute,
              private store: Store,
              public pService: PersonalizationService,
              private rend: Renderer2,
              private builder: AnimationBuilder) {
              this.routeSubscription = route.params.subscribe(params => this.id = params.id);
            }

  ngAfterViewInit(): void {
    this.goTo(this.active);
  }

  async ngOnInit() {

    await this.store.dispatch(new UpdateRoute(EntityType.NoteInner)).toPromise();


    this.pService.onResize();
    this.initWidthSlide();
    this.load();
    this.connectToHub();

    await this.store.dispatch(new LoadPrivateNotes()).toPromise();

    this.store.select(NoteStore.updateColorEvent)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.changeColorHandler(x));

    this.nameChanged.pipe(
      debounceTime(50))
      .subscribe(html => this.signal.hubConnection.invoke('UpdateDocumentFromClient', this.initModel(html)));

    setTimeout(() => this.pService.gridSettings('.grid-item-small'), 0);
  }


  changeColorHandler(updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      if (this.note.id === update.id) {
        this.note.color = update.color;
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  sizeChange() {
    if (!this.pService.check()) {
      this.getSize();
    } else {
      this.mainWidth = null;
      this.rend.setStyle(this.wrap.nativeElement, 'transform', 'translate3d( ' + 0 + '%,0,0)');
      this.active = 0;
    }
  }

  getSize() {
    this.mainWidth = window.innerWidth;
  }

  initWidthSlide() {
    if (!this.pService.check()) {
      this.getSize();
    } else {
      this.mainWidth = null;
    }
  }

  goTo(to: number) {
    if (!this.animating) {
      this.active = to;
      this.pos = -(100 / this.total) * to;
      this.animating = true;
      this.animFactory = this.builder.build(this.buildAnim());
      this.player = this.animFactory.create(this.wrap.nativeElement);
      this.player.onDone(() => {
        this.animEnd();
        this.animating = false;
        this.animMS = 700;
      });
      this.player.play();
    }
  }

  buildAnim() {
    const arr = [];
    arr.push(animate(this.animMS + 'ms ease', style({ transform: 'translate3d( ' + this.pos + '% ,0,0)' })) );
    return arr;
  }

  animEnd() {
    this.perc = 0;
    if (this.active < 0) {
      this.active = this.total - 1;
    }
    if (this.active > this.total - 1) {
      this.active = 0;
    }
    this.pos = -(100 / this.total) * this.active;
    this.rend.setStyle(this.wrap.nativeElement, 'transform', 'translate3d( ' + this.pos + '%,0,0)');
    this.player.destroy();
  }

  panStart(e) {
    if (!this.pService.check()) {
      this.getSize();
    }
  }

  panMove(e) {
    this.helper = document.getElementsByClassName('second-helper')[0];
    if (!this.pService.check()) {
      this.perc = 100 / this.total * e.deltaX / (this.mainWidth * this.total);
      this.pos = this.perc - 100 / this.total * this.active;
      if (this.active === 0 && (this.pos > 2 || this.pos > 0)) {
        return;
      }
      if (this.active === 1 && (this.pos > 2 || this.pos < -50)) {
        return;
      }
      if (this.helper.hasChildNodes()) {
        return;
      }
      this.rend.setStyle(this.wrap.nativeElement, 'transform', 'translate3d( ' +  this.pos + '%,0,0)');
    }
  }

  panEnd(e) {
    if (!this.pService.check()) {
      if (e.velocityX > 1) {
        if (this.active === 0 && this.pos > 0) {
          this.goTo(this.active);
        }
        this.animMS = this.animMS / e.velocityX;
        this.goTo(this.active - 1);
      } else if (e.velocityX < -1) {
        if (this.active === 1 && this.pos < -50) {
          this.goTo(this.active);
        }
        this.animMS = this.animMS / -e.velocityX;
        this.goTo(this.active + 1);
      } else {
        if (this.perc <= -(25 / this.total)) {
          if (this.active === 1 && this.pos < -50) {
            this.goTo(this.active);
          }
          this.goTo(this.active + 1);
        } else if (this.perc >= (25 / this.total)) {
          if (this.active === 0 && this.pos > 0) {
            this.goTo(this.active);
          }
          this.goTo(this.active - 1);
        } else {
          this.goTo(this.active);
        }
      }
    }
  }

  deleteSmallNote(item: any) {
    let counter = 0;
    this.notes = this.notes.filter(x => x !== item);
    const interval = setInterval(() => {
      if (counter === 35) {
        clearInterval(interval);
      }
      this.pService.grid.refreshItems().layout();
      counter++;
    }, 10);
  }

  turnUpSmallNote() {
    this.turnUpNote = !this.turnUpNote;
    setTimeout(() => this.pService.grid.refreshItems().layout(), 0);
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

    this.store.dispatch(new LoadAllExceptNotes(NoteType.Inner));

    this.store.select(NoteStore.oneFull)
    .pipe(take(1), map(func => func(this.id)))
    .subscribe((x) => {
      this.note = {...x};
      console.log(this.id);
      this.store.dispatch(new SelectIdNote(this.id, this.note.labelsIds));
    });
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
    this.store.dispatch(new UnSelectIdNote(this.id));
    this.routeSubscription.unsubscribe();
    this.signal.hubConnection.invoke('LeaveNote', this.id);
  }
}
