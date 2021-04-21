import {
  Component,
  OnInit,
  OnDestroy,
  Renderer2,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { SignalRService } from 'src/app/core/signal-r.service';
import { HubConnectionState } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {
  PersonalizationService,
  sideBarCloseOpen,
  deleteSmallNote,
  showHistory,
  showDropdown,
} from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/models/Theme';
import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { MurriService } from 'src/app/shared/services/murri.service';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { DeleteCurrentNote, LoadFullNote, LoadNotes, UpdateTitle } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/fullNote';
import { SmallNote } from '../models/smallNote';
import { LoadLabels } from '../../labels/state/labels-actions';
import { NotesService } from '../notes.service';
import { FullNoteSliderService } from '../full-note-slider.service';
import { FullNoteContentService } from '../full-note-content.service';
import { Album, BaseText, ContentModel, ContentType, HeadingType } from '../models/ContentMode';
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
import { TransformContentPhoto } from '../models/transform-content-photo';
import { UploadPhotosToAlbum } from '../models/uploadPhotosToAlbum';
import { RemovePhotoFromAlbum } from '../models/removePhotoFromAlbum';
import { SidebarNotesService } from '../sidebar-notes.service';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss'],
  animations: [sideBarCloseOpen, deleteSmallNote, showHistory, showDropdown],
  providers: [
    NotesService,
    FullNoteContentService,
    ContentEditableService,
    FullNoteSliderService,
    MurriService,
    SidebarNotesService,
  ],
})
export class FullNoteComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fullWrap') wrap: ElementRef;

  @ViewChildren('htmlComp') textElements: QueryList<ParentInteraction>;

  @ViewChildren('htmlComp', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(SelectionDirective) selectionDirective: SelectionDirective;

  @ViewChild('uploadPhotos') uploadPhoto: ElementRef;

  @ViewChildren('item', { read: ElementRef }) refSideBarElements: QueryList<ElementRef>;

  @Select(NoteStore.canView)
  public canView$: Observable<boolean>;

  @Select(NoteStore.canNoView)
  public canNoView$: Observable<boolean>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<ShortUser>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  public notesLink: SmallNote[];

  public positions = [
    new ConnectionPositionPair(
      {
        originX: 'end',
        originY: 'bottom',
      },
      { overlayX: 'end', overlayY: 'top' },
      0,
      1,
    ),
  ];

  seeAllUsers = false;

  loaded = false;

  contentType = ContentType;

  destroy = new Subject<void>();

  note: FullNote;

  contents: ContentModel[];

  theme = Theme;

  nameChanged: Subject<string> = new Subject<string>(); // CHANGE

  newLine: Subject<void> = new Subject();

  id: string;

  private routeSubscription: Subscription;

  constructor(
    private signal: SignalRService,
    private route: ActivatedRoute,
    private store: Store,
    public pService: PersonalizationService,
    private rend: Renderer2,
    public sliderService: FullNoteSliderService,
    public contentService: FullNoteContentService,
    private selectionService: SelectionService,
    private apiBrowserFunctions: ApiBrowserTextService,
    public menuSelectionService: MenuSelectionService,
    private api: ApiServiceNotes,
    public sideBarService: SidebarNotesService,
  ) {
    this.routeSubscription = route.params.subscribe(async (params) => {
      this.id = params.id;

      this.store
        .select(AppStore.appLoaded)
        .pipe(takeUntil(this.destroy))
        .subscribe(async (x: boolean) => {
          if (x) {
            await this.initNote();
            this.store.dispatch(new LoadLabels());
          }
        });
    });
  }

  @HostListener('window:resize', ['$event'])
  sizeChange() {
    if (!this.pService.check()) {
      this.sliderService.getSize();
    } else {
      this.sliderService.mainWidth = null;
      this.rend.setStyle(this.wrap.nativeElement, 'transform', `translate3d( ${0}%,0,0)`);
      this.sliderService.active = 0;
    }
  }

  ngAfterViewInit(): void {
    const note = this.store.selectSnapshot(NoteStore.oneFull);
    if (note) {
      this.sliderService.goTo(this.sliderService.active, this.wrap);
    }
    this.sideBarService.murriInitialise(this.refSideBarElements, this.id);
  }

  async initNote() {
    if (this.signal.hubConnection.state === HubConnectionState.Connected) {
      this.signal.hubConnection.invoke('LeaveNote', this.id);
    }
    await this.loadMain();
    await this.loadLeftMenuWithNotes();
    await this.sideBarService.loadNotes(this.id);
    this.connectToHub();
  }

  async loadMain() {
    await this.store.dispatch(new LoadFullNote(this.id)).toPromise();
    this.contents = await this.api.getContents(this.id).toPromise();
    this.store
      .select(NoteStore.oneFull)
      .pipe(takeUntil(this.destroy))
      .subscribe((note) => {
        this.note = note;
        this.loaded = true;
      });
  }

  async loadLeftMenuWithNotes() {
    const types = this.store.selectSnapshot(AppStore.getNoteTypes);
    const actions = types.map((x) => new LoadNotes(x.id, x));
    await this.store.dispatch(actions).toPromise();
    await this.setSideBarNotes(this.note.noteType.name);
  }

  async ngOnInit() {
    this.store.dispatch(new UpdateRoute(EntityType.NoteInner));
    this.pService.onResize();
    this.sliderService.rend = this.rend;
    this.sliderService.initWidthSlide();

    this.nameChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((title) => this.store.dispatch(new UpdateTitle(title)));

    this.newLine
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe(async () => {
        const resp = await this.api.newLine(this.note.id).toPromise();
        if (resp.success) {
          this.contents.push(resp.data);
        }
      });
  }

  removeAlbumHandler = async (id: string) => {
    const resp = await this.api.removeAlbum(this.note.id, id).toPromise();
    if (resp.success) {
      this.contents = this.contents.filter((x) => x.id !== id);
    }
  };

  uploadPhotoToAlbumHandler = async ($event: UploadPhotosToAlbum) => {
    const resp = await this.api
      .uploadPhotosToAlbum($event.formData, this.note.id, $event.id)
      .toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === $event.id);
      const newPhotos = resp.data.map((x) => ({ id: x, loaded: false }));
      const contentPhotos = (this.contents[index] as Album).photos;
      const resultPhotos = [...contentPhotos, ...newPhotos];
      const newAlbum = { ...this.contents[index], photos: resultPhotos };
      this.contents[index] = newAlbum;
    }
  };

  async removePhotoFromAlbumHandler(event: RemovePhotoFromAlbum) {
    const resp = await this.api
      .removePhotoFromAlbum(this.note.id, event.contentId, event.photoId)
      .toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === event.contentId);
      const contentPhotos = (this.contents[index] as Album).photos;
      if (contentPhotos.length === 1) {
        this.contents = this.contents.filter((x) => x.id !== event.contentId);
      } else {
        const newAlbum = {
          ...this.contents[index],
          photos: contentPhotos.filter((x) => x.id !== event.photoId),
        };
        this.contents[index] = newAlbum;
      }
    }
  }

  placeHolderClick($event) {
    $event.preventDefault();
    setTimeout(() => this.textElements?.last?.setFocus());
  }

  mouseEnter($event) {
    const native = this.textElements?.last?.getNative();
    if (native?.textContent.length !== 0) {
      this.addNewElementToEnd();
    }
    this.textElements?.last?.mouseEnter($event);
  }

  mouseOut($event) {
    this.textElements?.last?.mouseOut($event);
  }

  async enterHandler(
    value: EnterEvent, // TODO SETTIMEOUT
  ) {
    const breakLineType = value.breakModel.typeBreakLine;
    const { nextText } = value.breakModel;
    const newElement = await this.api
      .insertLine(this.note.id, value.contentId, breakLineType, nextText)
      .toPromise();

    if (!newElement.success) {
      return;
    }

    const elementCurrent = this.contents.find((x) => x.id === value.id);
    let index = this.contents.indexOf(elementCurrent);

    if (breakLineType === LineBreakType.NEXT) {
      index += 1;
    }

    this.contents.splice(index, 0, newElement.data);
    setTimeout(() => {
      this.textElements?.toArray()[index].setFocus();
    }, 0);
  }

  async deleteHTMLHandler(
    id: string, // TODO SETTIMEOUT AND CHANGE LOGIC
  ) {
    const resp = await this.api.removeContent(this.note.id, id).toPromise();

    if (resp.success) {
      const item = this.contents.find((x) => x.id === id);
      const indexOf = this.contents.indexOf(item);
      this.contents = this.contents.filter((z) => z.id !== id);
      const index = indexOf - 1;
      this.textElements?.toArray()[index].setFocusToEnd();
    }
  }

  async concatThisWithPrev(id: string) {
    // TODO SETTIMEOUT

    const resp = await this.api.concatWithPrevious(this.note.id, id).toPromise();

    if (resp.success) {
      const item = this.contents.find((x) => x.id === resp.data.id) as BaseText;
      const indexOf = this.contents.indexOf(item);
      this.contents[indexOf] = resp.data;
      this.contents = this.contents.filter((x) => x.id !== id);

      setTimeout(() => {
        const prevItemHtml = this.textElements?.toArray()[indexOf];
        prevItemHtml.setFocusToEnd();
      });
    }
  }

  async updateTextHandler(event: EditTextEventModel, isLast: boolean) {
    console.log('update text handler');
    this.api
      .updateContentText(this.note.id, event.contentId, event.content, event.checked)
      .toPromise();
    if (isLast) {
      this.addNewElementToEnd();
    }
  }

  selectionHandler(secondRect: DOMRect) {
    this.selectionService.selectionHandler(secondRect, this.refElements);
  }

  selectionStartHandler($event: DOMRect) {
    const isSelectionInZone = this.selectionService.isSelectionInZone($event, this.refElements);
    if (isSelectionInZone) {
      this.selectionService.isSelectionInside = true;
      this.selectionDirective.div.style.opacity = '0';
    } else {
      this.selectionService.isSelectionInside = false;
      this.selectionDirective.div.style.opacity = '1';
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async transformToPhoto(event: TransformContentPhoto) {
    const resp = await this.api
      .insertAlbumToNote(event.formData, this.note.id, event.id)
      .toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === event.id);
      this.contents[index] = resp.data;
    }
  }

  async transformToTypeText(value: TransformContent) {
    let indexOf;

    const resp = await this.api
      .updateContentType(this.note.id, value.id, value.contentType, value.headingType)
      .toPromise();

    if (!resp.success) {
      return;
    }

    switch (value.contentType) {
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
      default: {
        throw new Error('error');
      }
    }

    this.checkAddLastTextContent(indexOf);
  }

  defaultTextFocusClick(id: string, contentType: ContentType, headingType?: HeadingType): number {
    const item = this.contents.find((z) => z.id === id) as BaseText;
    const indexOf = this.contents.indexOf(item);
    item.type = contentType;
    if (headingType) {
      item.headingType = headingType;
    }
    setTimeout(() => {
      this.textElements?.toArray()[indexOf].setFocus();
    }, 0);
    return indexOf;
  }

  checkAddLastTextContent = (index: number) => {
    /*
    if (index === this.contents.length - 1)
    {
      this.addNewElementToEnd();
    }
    */
    console.log(index);
  };

  addNewElementToEnd() {
    this.newLine.next();
  }

  panMove(e) {
    this.sliderService.panMove(e, this.wrap);
  }

  panEnd(e) {
    this.sliderService.panEnd(e, this.wrap);
  }

  updateDoc = (str: string) => {
    // TODO
    // const note = { ...this.note };
    // note.title = str;
    // this.store.dispatch(new UpdateFullNote(note));
    console.log(str);
  };

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
      default: {
        throw new Error('error');
      }
    }
    this.notesLink = notes.filter((z) => z.id !== this.id);
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
    this.sideBarService.murriService.flagForOpacity = false;
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new DeleteCurrentNote());
    this.routeSubscription.unsubscribe();
    this.signal.hubConnection.invoke('LeaveNote', this.id);
  }
}
