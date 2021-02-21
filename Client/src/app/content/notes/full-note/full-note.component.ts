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
import { Theme } from 'src/app/shared/models/Theme';
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
import { BaseText, CheckedList, ContentModel, ContentType, DotList, Heading, HtmlText, NumberList } from '../models/ContentMode';
import { LineBreakType } from '../html-models';
import { SelectionService } from '../selection.service';
import { ContentEditableService } from '../content-editable.service';
import { SelectionDirective } from '../directives/selection.directive';
import { ApiBrowserTextService } from '../api-browser-text.service';
import { MenuSelectionService } from '../menu-selection.service';
import { EnterEvent } from '../models/enterEvent';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { TransformContent } from '../models/transform-content';


@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss'],
  animations: [
    sideBarCloseOpen,
    deleteSmallNote,
    showHistory],
  providers: [NotesService, FullNoteContentService,
    ContentEditableService, FullNoteSliderService, MurriService]
})
export class FullNoteComponent implements OnInit, OnDestroy, AfterViewInit {

  loaded = false;
  contentType = ContentType;
  contents: ContentModel[] = [];
  destroy = new Subject<void>();

  @ViewChild('fullWrap') wrap: ElementRef;

  @ViewChildren('htmlComp') textElements: QueryList<ParentInteraction>;
  @ViewChildren('htmlComp', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(SelectionDirective) selectionDirective: SelectionDirective;

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
    this.loaded = true;
  }

  removeAlbumHandler(id: string)
  {
    console.log(id);
    this.contents = this.contents.filter(x => x.contentId !== id);
  }

  placeHolderClick($event) {
    $event.preventDefault();
    setTimeout(() => this.textElements.last.setFocus());
  }

  mouseEnter($event) {
    const native = this.textElements.last.getNative();
    if (native.textContent.length !== 0)
    {
      this.addNewElementToEnd();
    }
    this.textElements.last.mouseEnter($event);
  }

  mouseOut($event) {
   this.textElements.last.mouseOut($event);
  }

  enterHandler(value: EnterEvent) // TODO SETTIMEOUT
  {
    const newElement = this.contentService.getTextContentByType(value.nextItemType);

    const elementCurrent = this.contents.find(x => x.contentId === value.id);
    let index = this.contents.indexOf(elementCurrent);

    switch (value.breakModel.typeBreakLine) {
      case LineBreakType.PREV_NO_CONTENT: {
        this.contents.splice(index, 0, newElement);
        setTimeout(() => { this.textElements.toArray()[index].setFocus(); }, 0);
        break;
      }
      case LineBreakType.NEXT_WITH_CONTENT: {
        newElement.data.content = value.breakModel.nextText;
        index++;
        this.contents.splice(index, 0, newElement);
        setTimeout(() => { this.textElements.toArray()[index].setFocus(); }, 0);
        break;
      }
      case LineBreakType.NEXT_NO_CONTENT: {
        index++;
        this.contents.splice(index, 0, newElement);
        setTimeout(() => { this.textElements.toArray()[index].setFocus(); }, 0);
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

    if (indexOf !== 0 && (indexOf !== this.contents.length - 1)) {
      this.contents = this.contents.filter(z => z.contentId !== id);
      const index = indexOf - 1;
      if (this.contents[index].type !== ContentType.PHOTO)
      {
        this.textElements.toArray()[index].setFocusToEnd();
      }
    }
    if (indexOf === this.contents.length - 1){
      const index = indexOf - 1;
      this.textElements.toArray()[index].setFocusToEnd();
    }
  }

  concatThisWithPrev(id: string) { // TODO SETTIMEOUT
    const item = this.contents.find(z => z.contentId === id) as ContentModel<BaseText>;
    const indexOf = this.contents.indexOf(item);
    if (indexOf > 0 && indexOf !== this.contents.length - 1)
    {
      const prevItem = this.contents[indexOf - 1] as ContentModel<BaseText>;
      const prevItemHtml = this.textElements.toArray()[indexOf - 1];

      this.contents = this.contents.filter(z => z.contentId !== id);

      const lengthText = prevItem.data.content.length;
      const resultHTML = prevItem.data.content += item.data.content;
      prevItemHtml.updateHTML(resultHTML);

      setTimeout(() => {
        const range = new Range();
        range.setStart(prevItemHtml.getNative().firstChild, lengthText);
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

  transformToType(value: TransformContent)
  {
    let indexOf;
    switch (value.type)
    {
      case ContentType.TEXT: {
        const item = this.contents.find(z => z.contentId === value.id) as ContentModel<HtmlText>;
        indexOf = this.contents.indexOf(item);
        item.type = value.type;
        setTimeout(() => { this.textElements.toArray()[indexOf].setFocus(); }, 0);
        break;
      }
      case ContentType.HEADING: {
        const item = this.contents.find(z => z.contentId === value.id) as ContentModel<Heading>;
        indexOf = this.contents.indexOf(item);
        item.type = value.type;
        item.data.headingType = value.heading;
        setTimeout(() => { this.textElements.toArray()[indexOf].setFocus(); }, 0);
        break;
      }
      case ContentType.DOTLIST: {
        const item = this.contents.find(z => z.contentId === value.id) as ContentModel<DotList>;
        indexOf = this.contents.indexOf(item);
        item.type = value.type;
        setTimeout(() => { this.textElements.toArray()[indexOf].setFocus(); }, 0);
        break;
      }
      case ContentType.NUMBERLIST: {
        const item = this.contents.find(z => z.contentId === value.id) as ContentModel<NumberList>;
        indexOf = this.contents.indexOf(item);
        item.type = value.type;
        setTimeout(() => { this.textElements.toArray()[indexOf].setFocus(); }, 0);
        break;
      }
      case ContentType.CHECKLIST: {
        const item = this.contents.find(z => z.contentId === value.id) as ContentModel<CheckedList>;
        indexOf = this.contents.indexOf(item);
        item.type = value.type;
        setTimeout(() => { this.textElements.toArray()[indexOf].setFocus(); }, 0);
        break;
      }
      case ContentType.PHOTO: {
        console.log('TODO'); // TODO
        break;
      }
    }
    this.checkAddLastTextContent(indexOf);
  }


  checkAddLastTextContent(index: number)
  {
    if (index === this.contents.length - 1)
    {
      this.addNewElementToEnd();
    }
  }

  addNewElementToEnd()
  {
    this.contents.push(this.contentService.getTextElement());
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


  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new DeleteCurrentNote());
    this.routeSubscription.unsubscribe();
    this.signal.hubConnection.invoke('LeaveNote', this.id);
  }

}
