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
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {
  PersonalizationService,
  sideBarCloseOpen,
  deleteSmallNote,
  showHistory,
} from 'src/app/shared/services/personalization.service';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { MurriService } from 'src/app/shared/services/murri.service';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { SignalRService } from 'src/app/core/signal-r.service';
import {
  DeleteCurrentNote,
  LoadFullNote,
  LoadNotes,
  LoadOnlineUsersOnNote,
  UpdateTitle,
} from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/full-note.model';
import { SmallNote } from '../models/small-note.model';
import { LoadLabels } from '../../labels/state/labels-actions';
import { NotesService } from '../notes.service';
import { FullNoteSliderService } from '../full-note-slider.service';
import {
  Album,
  BaseText,
  ContentModel,
  ContentTypeENUM,
  HeadingTypeENUM,
  NoteTextTypeENUM,
  Photo,
  PlaylistModel,
} from '../models/content-model.model';
import { LineBreakType } from '../html-models';
import { ContentEditableService } from '../content-editable.service';
import { SelectionDirective } from '../directives/selection.directive';
import { EnterEvent } from '../models/enter-event.model';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { TransformContent } from '../models/transform-content.model';
import { SelectionService } from '../selection.service';
import { ApiBrowserTextService } from '../api-browser-text.service';
import { MenuSelectionService } from '../menu-selection.service';
import { ApiServiceNotes } from '../api-notes.service';
import { EditTextEventModel } from '../models/edit-text-event.model';
import { TransformToFileContent } from '../models/transform-file-content.model';
import { UploadFileToEntity } from '../models/upload-files-to-entity';
import { RemovePhotoFromAlbum } from '../models/remove-photo-from-album.model';
import { SidebarNotesService } from '../sidebar-notes.service';
import { TypeUploadFile } from '../models/enums/type-upload-file.enum';
import { ApiNoteHistoryService } from '../api-note-history.service';
import { NoteHistory } from '../models/history/note-history.model';
import { RemoveAudioFromPlaylist } from '../models/remove-audio-from-playlist.model';
import { NotesUpdaterService } from '../notes-updater.service';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss'],
  animations: [sideBarCloseOpen, deleteSmallNote, showHistory],
  providers: [
    NotesService, // TODO MAYBE NO NEED
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
  public userBackground$: Observable<string>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  public notesLink: SmallNote[];

  loaded = false;

  contentType = ContentTypeENUM;

  textType = NoteTextTypeENUM;

  destroy = new Subject<void>();

  note: FullNote;

  contents: ContentModel[];

  nameChanged: Subject<string> = new Subject<string>(); // CHANGE

  newLine: Subject<void> = new Subject();

  id: string;

  histories: NoteHistory[];

  private routeSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    public pService: PersonalizationService,
    private rend: Renderer2,
    public sliderService: FullNoteSliderService,
    private selectionService: SelectionService,
    private apiBrowserFunctions: ApiBrowserTextService,
    public menuSelectionService: MenuSelectionService,
    private api: ApiServiceNotes,
    public sideBarService: SidebarNotesService,
    private apiHistory: ApiNoteHistoryService,
    private signalRService: SignalRService,
    private updateNoteService: NotesUpdaterService,
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
      this.rend.setStyle(this.wrap?.nativeElement, 'transform', `translate3d( ${0}%,0,0)`);
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

  getTextContent(index: number): BaseText {
    return this.contents[index] as BaseText;
  }

  async initNote() {
    await this.loadMain();
    await this.loadLeftMenuWithNotes();
    await this.sideBarService.loadNotes(this.id);
    this.histories = await this.apiHistory.getHistory(this.id).toPromise();
    await this.signalRService.joinNote(this.id);
    this.store.dispatch(new LoadOnlineUsersOnNote(this.id));
    this.signalRService.updateContentEvent
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.loadContent());
  }

  async loadContent() {
    this.contents = await this.api.getContents(this.id).toPromise();
  }

  async loadMain() {
    await this.store.dispatch(new LoadFullNote(this.id)).toPromise();
    await this.loadContent();
    this.store
      .select(NoteStore.oneFull)
      .pipe(takeUntil(this.destroy))
      .subscribe((note) => {
        this.note = note;
        this.loaded = true;
      });
  }

  async loadLeftMenuWithNotes() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    const types = Object.values(NoteTypeENUM).filter((z) => typeof z === 'number');
    const actions = types.map((t: NoteTypeENUM) => new LoadNotes(t, pr));

    await this.store.dispatch(actions).toPromise();
    await this.setSideBarNotes(this.note?.noteTypeId);
  }

  async ngOnInit() {
    this.store.dispatch(new UpdateRoute(EntityType.NoteInner));
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

  removePlaylistHandler = async (id: string) => {
    const resp = await this.api.removePlaylist(this.note.id, id).toPromise();
    if (resp.success) {
      this.contents = this.contents.filter((x) => x.id !== id);
    }
  };

  removeDocumentHandler = async (id: string) => {
    const resp = await this.api.removeFileFromNote(this.note.id, id).toPromise();
    if (resp.success) {
      this.contents = this.contents.filter((x) => x.id !== id);
    }
  };

  removeVideoHandler = async (id: string) => {
    const resp = await this.api.removeVideoFromNote(this.note.id, id).toPromise();
    if (resp.success) {
      this.contents = this.contents.filter((x) => x.id !== id);
    }
  };

  uploadAudiosToPlaylistHandler = async ($event: UploadFileToEntity) => {
    const resp = await this.api
      .uploadAudiosToPlaylist($event.formData, this.note.id, $event.id)
      .toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === $event.id);
      const { audios } = this.contents[index] as PlaylistModel;
      const resultAudios = [...audios, ...resp.data];
      const newPlaylist: PlaylistModel = {
        ...(this.contents[index] as PlaylistModel),
        audios: resultAudios,
      };
      this.contents[index] = newPlaylist;
    }
  };

  uploadPhotoToAlbumHandler = async ($event: UploadFileToEntity) => {
    const resp = await this.api
      .uploadPhotosToAlbum($event.formData, this.note.id, $event.id)
      .toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === $event.id);
      const newPhotos: Photo[] = resp.data.map(
        (x) =>
          new Photo(x.fileId, x.photoPathSmall, x.photoPathMedium, x.photoPathBig, false, x.name),
      );
      const contentPhotos = (this.contents[index] as Album).photos;
      const resultPhotos = [...contentPhotos, ...newPhotos];
      const newAlbum: Album = { ...(this.contents[index] as Album), photos: resultPhotos };
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
        const newAlbum: Album = {
          ...(this.contents[index] as Album),
          photos: contentPhotos.filter((x) => x.fileId !== event.photoId),
        };
        this.contents[index] = newAlbum;
      }
    }
  }

  async changePlaylistName(contentId: string) {
    // TODO
    const name = 'any name';
    const resp = await this.api.changePlaylistName(this.note.id, contentId, name).toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === contentId);
      (this.contents[index] as PlaylistModel).name = name;
    }
  }

  async removeAudioFromPlaylistHandler(event: RemoveAudioFromPlaylist) {
    const resp = await this.api
      .removeAudioFromPlaylist(this.note.id, event.contentId, event.audioId)
      .toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === event.contentId);
      const { audios } = this.contents[index] as PlaylistModel;
      if (audios.length === 1) {
        this.contents = this.contents.filter((x) => x.id !== event.contentId);
      } else {
        const newPlaylist: PlaylistModel = {
          ...(this.contents[index] as PlaylistModel),
          audios: audios.filter((x) => x.fileId !== event.audioId),
        };
        this.contents[index] = newPlaylist;
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
      .insertLine(this.note.id, value.contentId, value.nextItemType, breakLineType, nextText)
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
    this.api
      .updateContentText(
        this.note.id,
        event.contentId,
        event.content,
        event.checked,
        event.isBold,
        event.isItalic,
      )
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
  async transformToFileType(event: TransformToFileContent) {
    let resp;
    switch (event.typeFile) {
      case TypeUploadFile.PHOTOS: {
        resp = await this.api.insertAlbumToNote(event.formData, this.note.id, event.id).toPromise();
        break;
      }
      case TypeUploadFile.AUDIOS: {
        resp = await this.api
          .insertAudiosToNote(event.formData, this.note.id, event.id)
          .toPromise();
        break;
      }
      case TypeUploadFile.FILES: {
        resp = await this.api.insertFilesToNote(event.formData, this.note.id, event.id).toPromise();
        break;
      }
      case TypeUploadFile.VIDEOS: {
        resp = await this.api
          .insertVideosToNote(event.formData, this.note.id, event.id)
          .toPromise();
        break;
      }
      default: {
        throw new Error('incorrect type');
      }
    }

    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === event.id);
      this.contents[index] = resp.data;
    }
  }

  async transformToTypeText(value: TransformContent) {
    let indexOf;

    const resp = await this.api
      .updateContentType(this.note.id, value.id, value.textType, value.headingType)
      .toPromise();

    if (!resp.success) {
      return;
    }

    switch (value.textType) {
      case NoteTextTypeENUM.Default: {
        indexOf = this.defaultTextFocusClick(value.id, value.textType);
        break;
      }
      case NoteTextTypeENUM.Checklist: {
        indexOf = this.defaultTextFocusClick(value.id, value.textType);
        break;
      }
      case NoteTextTypeENUM.Dotlist: {
        indexOf = this.defaultTextFocusClick(value.id, value.textType);
        break;
      }
      case NoteTextTypeENUM.Heading: {
        indexOf = this.defaultTextFocusClick(value.id, value.textType, value.headingType);
        break;
      }
      case NoteTextTypeENUM.Numberlist: {
        indexOf = this.defaultTextFocusClick(value.id, value.textType);
        break;
      }
      default: {
        throw new Error('error');
      }
    }

    this.checkAddLastTextContent(indexOf);
  }

  defaultTextFocusClick(
    id: string,
    textTypeId: NoteTextTypeENUM,
    headingType?: HeadingTypeENUM,
  ): number {
    const item = this.contents.find((z) => z.id === id) as BaseText;
    const indexOf = this.contents.indexOf(item);
    item.noteTextTypeId = textTypeId;
    if (headingType) {
      item.headingTypeId = headingType;
    }
    setTimeout(() => {
      this.textElements?.toArray()[indexOf].setFocusToEnd();
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

  // EDITING DOCUMENT

  onInput($event) {
    this.nameChanged.next($event.target.innerText);
  }

  pasteCommandHandler(e) {
    this.apiBrowserFunctions.pasteCommandHandler(e);
  }

  async ngOnDestroy() {
    this.updateNoteService.ids$.next([...this.updateNoteService.ids$.getValue(), this.id]);
    await this.signalRService.leaveNote(this.id);
    this.sideBarService.murriService.flagForOpacity = false;
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new DeleteCurrentNote());
    this.routeSubscription.unsubscribe();
  }
}
