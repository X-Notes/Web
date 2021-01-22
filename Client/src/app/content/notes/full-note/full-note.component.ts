import {
  Component, OnInit, OnDestroy,
  Renderer2, ViewChild, ElementRef, HostListener, AfterViewInit, QueryList, ViewChildren, ChangeDetectorRef
} from '@angular/core';
import { SignalRService } from 'src/app/core/signal-r.service';
import { HubConnectionState } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { DeleteCurrentNote, LoadAllNotes, LoadFullNote, UpdateTitle } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/fullNote';
import { debounceTime, takeUntil } from 'rxjs/operators';
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
import { FullNoteContentService } from '../full-note-content.service';
import { BaseText, ContentModel, ContentType, HtmlText } from '../models/ContentMode';
import { HtmlComponent } from '../full-note-components/html/html.component';
import { LineBreakType } from '../html-models';
import { SelectionService } from '../selection.service';
import { ContentEditableService } from '../content-editable.service';
import { SelectionDirective } from '../directives/selection.directive';
import { ApiBrowserTextService } from '../api-browser-text.service';
import { MenuSelectionService } from '../menu-selection.service';
import { EnterEvent } from '../models/enterEvent';


@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss'],
  animations: [
    sideBarCloseOpen,
    deleteSmallNote,
    showHistory],
  providers: [NotesService, FullNoteContentService,
    ContentEditableService, FullNoteSliderService]
})
export class FullNoteComponent implements OnInit, OnDestroy, AfterViewInit {

  loaded = false;
  contentType = ContentType;
  contents: ContentModel[] = [];
  destroy = new Subject<void>();

  @ViewChild('fullWrap') wrap: ElementRef;

  @ViewChildren('htmlComp') htmlElements: QueryList<HtmlComponent>;
  @ViewChildren('htmlComp', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(SelectionDirective) selectionDirective: SelectionDirective;

  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  theme = Theme;

  notes: number[] = [1, 2, 3, 4, 5, 6];
  turnUpNote = false;

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
              public murriService: MurriService,
              public contentService: FullNoteContentService,
              private selectionService: SelectionService,
              private apiBrowserFunctions: ApiBrowserTextService,
              public menuSelectionService: MenuSelectionService) {

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
    this.setCustomCopy();
  }

  async LoadMain() {
    await this.store.dispatch(new LoadFullNote(this.id)).toPromise();
    this.loaded = true;
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
    this.contents = this.contentService.getContent();
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

  placeHolderClick($event) {
    $event.preventDefault();
    setTimeout(() => this.htmlElements.last.setFocus());
  }

  mouseEnter($event) {
    this.htmlElements.last.mouseEnter($event);
  }

  mouseOut($event) {
    this.htmlElements.last.mouseOut($event);
  }

  enterHandler(value: EnterEvent) // TODO SETTIMEOUT
  {
    const newElement = this.contentService.getTextContentByType(value.nextItemType);

    const elementCurrent = this.contents.find(x => x.contentId === value.id);
    let index = this.contents.indexOf(elementCurrent);

    switch (value.breakModel.typeBreakLine) {
      case LineBreakType.PREV_NO_CONTENT: {
        this.contents.splice(index, 0, newElement);
        setTimeout(() => { this.htmlElements.toArray()[index].setFocus(); }, 0);
        break;
      }
      case LineBreakType.NEXT_WITH_CONTENT: {
        newElement.data.content = value.breakModel.nextText;
        index++;
        this.contents.splice(index, 0, newElement);
        setTimeout(() => { this.htmlElements.toArray()[index].setFocus(); }, 0);
        break;
      }
      case LineBreakType.NEXT_NO_CONTENT: {
        index++;
        this.contents.splice(index, 0, newElement);
        setTimeout(() => { this.htmlElements.toArray()[index].setFocus(); }, 0);
        break;
      }
    }

    const numb = Math.random() * (100000 - 1) + 1;
    setTimeout(() => newElement.contentId = numb.toString(), 100);
  }

  deleteHTMLHandler(id: string) // TODO SETTIMEOUT AND CHANGE LOGIC
  {
    const item = this.contents.find(z => z.contentId === id);
    const indexOf = this.contents.indexOf(item);

    if (indexOf !== 0 && (indexOf !== this.contents.length - 1 || this.isElementEmpty(indexOf - 1))) {
      this.contents = this.contents.filter(z => z.contentId !== id);
      const index = indexOf - 1;
      if (this.contents[index].type === ContentType.TEXT)
      {
        this.htmlElements.toArray()[index].setFocusToEnd();
      }
    }
    if (indexOf === this.contents.length - 1){
      const index = indexOf - 1;
      this.htmlElements.toArray()[index].setFocusToEnd();
    }
  }

  isElementEmpty(index: number)
  {
    const content = this.contents[index];
    if (content.type === ContentType.TEXT)
    {
      const contentHTML = content as ContentModel<HtmlText>;
      return contentHTML.data.content === '';
    }
    return false;
  }

  concatThisWithPrev(id: string) {
    const item = this.contents.find(z => z.contentId === id) as ContentModel<HtmlText>;
    const indexOf = this.contents.indexOf(item);
    if (indexOf > 0 && indexOf !== this.contents.length - 1)
    {
      const prevItem = this.contents[indexOf - 1] as ContentModel<HtmlText>;
      const prevItemHtml = this.htmlElements.toArray()[indexOf - 1];

      this.contents = this.contents.filter(z => z.contentId !== id);

      const lengthText = prevItem.data.content.length;
      const resultHTML = prevItem.data.content += item.data.content;
      prevItemHtml.updateHTML(resultHTML);

      setTimeout(() => {
        const range = new Range();
        range.setStart(prevItemHtml.getTextChild.firstChild, lengthText);
        const selection = this.apiBrowserFunctions.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      });
    }
  }

  selectionHandler(secondRect: DOMRect) {
    this.selectionService.selectionHandler(secondRect, this.refElements);
  }

  selectionStartHandler($event: DOMRect) {
    const isSelectionInZone = this.selectionService.isSelectionInZone($event, this.refElements);
    if (isSelectionInZone)
    {
      this.selectionService.isSelectionInside = true;
      this.selectionDirective.div.style.opacity = '0';
    }else{
      this.selectionService.isSelectionInside = false;
      this.selectionDirective.div.style.opacity = '1';
    }
  }

  transformToText(id: string)
  {
    const item = this.contents.find(z => z.contentId === id);
    const indexOf = this.contents.indexOf(item);
    item.type = ContentType.TEXT;
    setTimeout(() => { this.htmlElements.toArray()[indexOf].setFocus(); }, 0);
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
    this.apiBrowserFunctions.pasteCommandHandler(e);
  }

  setCustomCopy()
  {
    const body = document.getElementsByTagName('body')[0];
    body.addEventListener('copy', (e) => this.customCopy(e));
  }

  customCopy(e)
  {
    let items = this.refElements.toArray().map(item => (item.nativeElement as HTMLElement).firstChild as HTMLElement);
    items = items.filter(item => item.attributes.getNamedItem('selectedByUser') !== null);
    const texts = items.map(item => item.textContent);
    if (texts.length > 0)
    {
      const resultText = texts.reduce((pv, cv) => pv + '\n' + cv);
      this.apiBrowserFunctions.copyTest(resultText);
    }
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
