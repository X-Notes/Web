import {
  Component, OnInit, OnDestroy,
  Renderer2, ViewChild, ElementRef, HostListener, AfterViewInit, QueryList, ViewChildren, ChangeDetectorRef
} from '@angular/core';
import { SignalRService } from 'src/app/core/signal-r.service';
import { HubConnectionState } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { DeleteCurrentNote, LoadFullNote, LoadNotes, UpdateTitle, UploadImagesToNote } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/fullNote';
import { catchError, debounceTime, take, takeUntil } from 'rxjs/operators';
import {
  PersonalizationService,
  sideBarCloseOpen,
  deleteSmallNote,
  showHistory
} from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/models/Theme';
import { SmallNote } from '../models/smallNote';
import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { LoadLabels } from '../../labels/state/labels-actions';
import { NotesService } from '../notes.service';
import { FullNoteSliderService } from '../full-note-slider.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { MenuButtonsService } from '../../navigation/menu-buttons.service';
import { FullNoteContentService } from '../full-note-content.service';
import { BaseText, ContentModel, ContentType, HeadingType } from '../models/ContentMode';
import { LineBreakType } from '../html-models';
import { ContentEditableService } from '../content-editable.service';
import { SelectionDirective } from '../directives/selection.directive';
import { EnterEvent } from '../models/enterEvent';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { TransformContent } from '../models/transform-content';
import { SelectionService } from '../selection.service';
import { ApiBrowserTextService } from '../api-browser-text.service';
import { MenuSelectionService } from '../menu-selection.service';
import { ApiServiceNotes } from '../api-notes.service';
import { EditTextEventModel } from '../models/EditTextEventModel';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';



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
  destroy = new Subject<void>();

  @ViewChild('fullWrap') wrap: ElementRef;

  @ViewChildren('htmlComp') textElements: QueryList<ParentInteraction>;
  @ViewChildren('htmlComp', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(SelectionDirective) selectionDirective: SelectionDirective;

  @ViewChild('uploadPhotos') uploadPhoto: ElementRef;

  note: FullNote;
  contents: ContentModel[];

  theme = Theme;

  notes: number[] = [0, 1, 2, 3, 4, 5];

  nameChanged: Subject<string> = new Subject<string>(); // CHANGE
  newLine: Subject<void> = new Subject();

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
              public menuSelectionService: MenuSelectionService,
              public buttonService: MenuButtonsService,
              private api: ApiServiceNotes) {

    this.routeSubscription = route.params.subscribe(async (params) => {
      this.id = params.id;

      this.store.select(AppStore.appLoaded)
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
    this.contents = await this.api.getContents(this.id).toPromise();

    this.store.select(NoteStore.oneFull)
    .pipe(takeUntil(this.destroy))
    .subscribe(note => this.note = note);

    this.loaded = true;
  }

  async LoadSecond() {

    const types = this.store.selectSnapshot(AppStore.getNoteTypes);
    const actions = types.map(x => new LoadNotes(x.id, x));
    await this.store.dispatch(actions).toPromise();

    await this.setSideBarNotes(this.note.noteType.name);

  }

  async ngOnInit() {
    this.store.dispatch(new UpdateRoute(EntityType.NoteInner));
    this.pService.onResize();
    this.sliderService.rend = this.rend;
    this.sliderService.initWidthSlide();

    this.nameChanged.pipe(
      takeUntil(this.destroy),
      debounceTime(updateNoteContentDelay))
      .subscribe(title => this.store.dispatch(new UpdateTitle(title)));

    this.newLine.pipe(
      takeUntil(this.destroy),
      debounceTime(updateNoteContentDelay))
      .subscribe(async (event) => {
        const resp = await this.api.newLine(this.note.id).toPromise();
        if (resp.success){
        this.contents.push(resp.data);
        }
      });

    setTimeout(() => this.murriService.gridSettings('.grid-item-small',
      document.querySelector('.grid') as HTMLElement, true), 3000); // CHANGE TODO
    setTimeout(async () => this.murriService.setOpacityTrueAsync(), 1500); // CHANGE TODO
    this.loaded = true;
  }

  removeAlbumHandler(id: string)
  {
    console.log('TODO');
  }

  placeHolderClick($event) {
    $event.preventDefault();
    setTimeout(() => this.textElements?.last?.setFocus());
  }

  mouseEnter($event) {
    const native = this.textElements?.last?.getNative();
    if (native?.textContent.length !== 0)
    {
      this.addNewElementToEnd();
    }
    this.textElements?.last?.mouseEnter($event);
  }

  mouseOut($event) {
   this.textElements?.last?.mouseOut($event);
  }

  async enterHandler(value: EnterEvent) // TODO SETTIMEOUT
  {
    const breakLineType = value.breakModel.typeBreakLine;
    const nextText = value.breakModel.nextText;
    const newElement = await this.api.insertLine(this.note.id, value.contentId, breakLineType, nextText).toPromise();

    if (!newElement.success)
    {
      return;
    }

    const elementCurrent = this.contents.find(x => x.id === value.id);
    let index = this.contents.indexOf(elementCurrent);

    if (breakLineType === LineBreakType.NEXT)
    {
      index++;
    }

    this.contents.splice(index, 0, newElement.data);
    setTimeout(() => { this.textElements?.toArray()[index].setFocus(); }, 0);

  }

  async deleteHTMLHandler(id: string) // TODO SETTIMEOUT AND CHANGE LOGIC
  {
    const resp = await this.api.removeContent(this.note.id, id).toPromise();

    if (resp.success)
    {
      const item = this.contents.find(x => x.id === id);
      const indexOf = this.contents.indexOf(item);
      this.contents = this.contents.filter(z => z.id !== id);
      const index = indexOf - 1;
      this.textElements?.toArray()[index].setFocusToEnd();
    }
  }

  async concatThisWithPrev(id: string) { // TODO SETTIMEOUT

    const resp = await this.api.concatWithPrevious(this.note.id, id).toPromise();

    if (resp.success)
    {
      const item = this.contents.find(x => x.id === resp.data.id) as BaseText;
      const indexOf = this.contents.indexOf(item);
      this.contents[indexOf] = resp.data;
      this.contents = this.contents.filter(x => x.id !== id);

      setTimeout(() => {
        const prevItemHtml = this.textElements?.toArray()[indexOf];
        prevItemHtml.setFocusToEnd();
      });
    }
  }

  async updateTextHandler(event: EditTextEventModel, isLast: boolean)
  {
    this.api.updateContentText(this.note.id, event.contentId, event.content, event.checked).toPromise();
    if (isLast) {
      this.addNewElementToEnd();
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

  async transformToType(value: TransformContent)
  {
    const resp = await this.api.updateContentType(this.note.id, value.id, value.contentType, value.headingType).toPromise();

    if (!resp.success)
    {
      return;
    }

    let indexOf;
    switch (value.contentType)
    {
      case ContentType.DEFAULT: {
        indexOf = this.defaultTextFocusClick(value.id, value.contentType);
        break;
      }
      case ContentType.CHECKLIST: {
        indexOf = this.defaultTextFocusClick(value.id, value.contentType);
        break;
      }
      case ContentType.DOTLIST: {
        indexOf = this.defaultTextFocusClick(value.id, value.contentType);
        break;
      }
      case ContentType.HEADING: {
        indexOf = this.defaultTextFocusClick(value.id, value.contentType, value.headingType);
        break;
      }
      case ContentType.NUMBERLIST: {
        indexOf = this.defaultTextFocusClick(value.id, value.contentType);
        break;
      }
      case ContentType.ALBUM: {
        this.uploadPhoto.nativeElement.click();
        break;
      }
    }
    this.checkAddLastTextContent(indexOf);
  }

  defaultTextFocusClick(id: string, contentType: ContentType, headingType?: HeadingType): number
  {
    const item = this.contents.find(z => z.id === id) as BaseText;
    const indexOf = this.contents.indexOf(item);
    item.type = contentType;
    if (headingType)
    {
      item.headingType = headingType;
    }
    setTimeout(() => { this.textElements?.toArray()[indexOf].setFocus(); }, 0);
    return indexOf;
  }

  async uploadImages(event) {
    const data = new FormData();
    const files = event.target.files;
    for (const file of files)
    {
      data.append('photos', file);
    }
    this.store.dispatch(new UploadImagesToNote(data));
  }

  checkAddLastTextContent(index: number)
  {
    /*
    if (index === this.contents.length - 1)
    {
      this.addNewElementToEnd();
    }
    */
  }

  addNewElementToEnd()
  {
    this.newLine.next();
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



  setSideBarNotes(noteType: NoteTypeENUM) {
    let notes: SmallNote[];
    switch (noteType) {
      case NoteTypeENUM.Deleted: {
        notes = this.store.selectSnapshot(NoteStore.deletedNotes);
        break;
      }
      case NoteTypeENUM.Private: {
        notes = this.store.selectSnapshot(NoteStore.privateNotes);
        break;
      }
      case NoteTypeENUM.Shared: {
        notes = this.store.selectSnapshot(NoteStore.sharedNotes);
        break;
      }
      case NoteTypeENUM.Archive: {
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
    this.nameChanged.next($event.target.innerText);
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
