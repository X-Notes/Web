/* eslint-disable no-param-reassign */
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { HtmlTitleService } from 'src/app/core/html-title.service';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import { FullNote } from '../../models/full-note.model';
import { UpdateNoteTitle } from '../../state/notes-actions';
import { SelectionDirective } from '../directives/selection.directive';
import { EnterEvent } from '../models/enter-event.model';
import { TypeUploadFile } from '../models/enums/type-upload-file.enum';
import { NoteSnapshot } from '../models/history/note-snapshot.model';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { TransformContent } from '../models/transform-content.model';
import { TransformToFileContent } from '../models/transform-file-content.model';
import { ContentEditableService } from '../content-editor-services/content-editable.service';
import { FullNoteSliderService } from '../services/full-note-slider.service';
import { MenuSelectionService } from '../content-editor-services/menu-selection.service';
import { SelectionService } from '../content-editor-services/selection.service';
import { ContentEditorContentsService } from '../content-editor-services/content-editor-contents.service';
import { ContentEditorPhotosCollectionService } from '../content-editor-services/file-content/content-editor-photos.service';
import { ContentEditorDocumentsCollectionService } from '../content-editor-services/file-content/content-editor-documents.service';
import { ContentEditorVideosCollectionService } from '../content-editor-services/file-content/content-editor-videos.service';
import { ContentEditorAudiosCollectionService } from '../content-editor-services/file-content/content-editor-audios.service';
import { ContentEditorTextService } from '../content-editor-services/text-content/content-editor-text.service';
import { ContentEditorElementsListenerService } from '../content-editor-services/content-editor-elements-listener.service';
import { ContentEditorListenerService } from '../content-editor-services/content-editor-listener.service';
import { UploadFileToEntity } from '../models/upload-files-to-entity';
import { TypeUploadFormats } from '../models/enums/type-upload-formats.enum';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { BaseText, NoteTextTypeENUM } from '../../models/editor-models/base-text';
import { InputHtmlEvent } from '../full-note-components/html-components/models/input-html-event';
import { UpdateStyleMode, UpdateTextStyles } from '../../models/update-text-styles';
import { DeltaConverter } from './converter/delta-converter';
import { WebSocketsNoteUpdaterService } from '../content-editor-services/web-sockets-note-updater.service';
import { VideosCollection } from '../../models/editor-models/videos-collection';
import { DocumentsCollection } from '../../models/editor-models/documents-collection';
import { AudiosCollection } from '../../models/editor-models/audios-collection';
import { PhotosCollection } from '../../models/editor-models/photos-collection';
import { DiffCheckerService } from './diffs/diff-checker.service';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss'],
  providers: [ContentEditableService, WebSocketsNoteUpdaterService],
})
export class ContentEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('htmlComp') elements: QueryList<ParentInteraction>;

  @ViewChildren('htmlComp', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(SelectionDirective) selectionDirective: SelectionDirective;

  @ViewChild('noteTitle', { read: ElementRef }) noteTitleEl: ElementRef<HTMLElement>;

  @Input()
  isReadOnlyMode = true;

  @Input()
  note: FullNote | NoteSnapshot;

  @Select(UserStore.getUserTheme)
  theme$: Observable<ThemeENUM>;

  @Input()
  title$: Observable<string>;

  title: string;

  uiTitle: string;

  noteTitleChanged: Subject<string> = new Subject<string>(); // CHANGE

  theme = ThemeENUM;

  contentType = ContentTypeENUM;

  textType = NoteTextTypeENUM;

  destroy = new Subject<void>();

  constructor(
    public selectionService: SelectionService,
    @Optional() public sliderService: FullNoteSliderService,
    private apiBrowserFunctions: ApiBrowserTextService,
    private store: Store,
    public menuSelectionService: MenuSelectionService,
    public contentEditorContentsService: ContentEditorContentsService,
    public contentEditorPhotosService: ContentEditorPhotosCollectionService,
    public contentEditorDocumentsService: ContentEditorDocumentsCollectionService,
    public contentEditorVideosService: ContentEditorVideosCollectionService,
    public contentEditorAudiosService: ContentEditorAudiosCollectionService,
    public contentEditorTextService: ContentEditorTextService,
    private contentEditorElementsListenersService: ContentEditorElementsListenerService,
    private contentEditorListenerService: ContentEditorListenerService,
    private cdr: ChangeDetectorRef,
    private htmlTitleService: HtmlTitleService,
    private webSocketsUpdaterService: WebSocketsNoteUpdaterService,
    private contentEditableService: ContentEditableService,
    private diffCheckerService: DiffCheckerService,
  ) {}

  get contents() {
    return this.contentEditorContentsService.getContents;
    // return this.contentEditorContentsService.getContents.sort((a, b) => a.order - b.order); TODO
  }

  @Input() set contents(contents: ContentModelBase[]) {
    if (this.isReadOnlyMode) {
      this.contentEditorContentsService.initOnlyRead(contents, this.note.id);
    } else {
      this.contentEditorContentsService.init(contents, this.note.id);
    }
  }

  ngAfterViewInit(): void {
    this.contentEditorElementsListenersService.setHandlers(this.elements);
    this.contentEditorListenerService.setHandlers(this.elements, this.noteTitleEl);
    this.webSocketsUpdaterService.tryJoinToNote(this.note.id);
  }

  ngOnDestroy(): void {
    this.webSocketsUpdaterService.leaveNote(this.note.id);
    this.destroy.next();
    this.destroy.complete();
    this.contentEditorElementsListenersService.destroysListeners();
    this.contentEditorListenerService.destroysListeners();
  }

  setTitle(): void {
    // SET
    this.uiTitle = this.note.title;
    this.title = this.note.title;
    this.htmlTitleService.setCustomOrDefault(this.title, 'titles.note');

    // UPDATE WS
    this.title$.pipe(takeUntil(this.destroy)).subscribe((title) => this.updateTitle(title));

    // UPDATE CURRENT
    this.noteTitleChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((title) => {
        const diffs = this.diffCheckerService.getDiffs(this.title, title);
        this.store.dispatch(new UpdateNoteTitle(diffs, title, this.note.id, true, null, false));
        this.title = title;
        this.htmlTitleService.setCustomOrDefault(title, 'titles.note');
      });
  }

  updateTitle(title: string): void {
    if (this.title !== title && this.noteTitleEl?.nativeElement) {
      const pos = this.apiBrowserFunctions.getSelectionCharacterOffsetsWithin(
        this.noteTitleEl?.nativeElement,
      );
      this.uiTitle = title;
      this.title = title;
      this.htmlTitleService.setCustomOrDefault(title, 'titles.note');
      requestAnimationFrame(() =>
        this.contentEditableService.setCaret(this.noteTitleEl?.nativeElement, pos?.start),
      );
    }
  }

  onTitleInput($event) {
    this.noteTitleChanged.next($event.target.innerText);
  }

  handlerTitleEnter($event: KeyboardEvent) {
    $event.preventDefault();
    this.contentEditorTextService.appendNewEmptyContentToStart();
    setTimeout(() => this.elements?.first?.setFocus());
    this.postAction();
  }

  ngOnInit(): void {
    this.setTitle();

    this.contentEditorElementsListenersService.onPressDeleteOrBackSpaceSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        for (const itemId of this.selectionService.getSelectedItems()) {
          this.deleteRowHandler(itemId);
          this.selectionService.removeFromSelectedItems(itemId);
        }
      });

    this.contentEditorElementsListenersService.onPressCtrlASubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        const ids = this.contents.map((x) => x.id);
        this.selectionService.selectItems(ids);
      });

    this.contentEditorElementsListenersService.onPressCtrlZSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.contentEditorContentsService.restorePrev());

    this.contentEditorElementsListenersService.onPressCtrlSSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.contentEditorContentsService.changeImmediately());

    this.contentEditorListenerService.onPressEnterSubject
      .pipe(takeUntil(this.destroy))
      .subscribe((contentId: string) => {
        if (contentId) {
          this.enterHandler({
            breakModel: { isFocusToNext: true },
            nextItemType: NoteTextTypeENUM.Default,
            contentId,
          });
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFocusHandler(content: ParentInteraction) {
    this.elements.forEach((x) => x.markForCheck()); // TO Mb optimization
  }

  pasteCommandHandler(e) {
    this.apiBrowserFunctions.pasteCommandHandler(e);
  }

  getElementById(id: string): ParentInteraction {
    return this.elements.find((z) => z.getContentId() === id);
  }

  selectionHandler(secondRect: DOMRect) {
    this.selectionService.selectionHandler(secondRect, this.elements);
  }

  selectionStartHandler($event: DOMRect) {
    const isSelectionInZone = this.selectionService.isSelectionInZone(
      $event,
      this.elements,
      this.noteTitleEl,
    );
    if (isSelectionInZone) {
      this.selectionService.isSelectionInside = true;
      this.selectionDirective.div.style.opacity = '0';
    } else {
      this.selectionService.isSelectionInside = false;
      this.selectionDirective.div.style.opacity = '1';
    }
  }

  enterHandler(value: EnterEvent) {
    const curEl = this.elements?.toArray().find((x) => x.getContentId() === value.contentId);
    curEl.syncHtmlWithLayout();
    const obj = this.contentEditorTextService.insertNewContent(
      value.contentId,
      value.nextItemType,
      value.breakModel.isFocusToNext,
    );
    setTimeout(() => {
      const el = this.elements?.toArray()[obj.index];
      const delta = DeltaConverter.convertHTMLToDelta(value.breakModel.nextHtml);
      const model = DeltaConverter.convertToTextBlocks(delta);
      el.updateHTML(model);
      el.setFocus();
    });
  }

  deleteRowHandler(id: string) {
    const index = this.contentEditorTextService.deleteContent(id);
    this.elements?.toArray()[index].setFocusToEnd();
    this.postAction();
  }

  concatThisWithPrev(id: string) {
    const data = this.contentEditorContentsService.getContentAndIndexById<BaseText>(id);
    const indexPrev = data.index - 1;

    const prevContent = this.contentEditorContentsService.getContentByIndex<BaseText>(indexPrev);

    const currentElement = this.getElementById(id);
    const prevElement = this.getElementById(prevContent.id);

    const resContent = [...prevElement.getTextBlocks(), ...currentElement.getTextBlocks()];

    const prevRef = this.elements.find((z) => z.getContentId() === prevContent.id);
    prevRef.updateHTML(resContent);
    this.contentEditorContentsService.deleteById(id, false);

    setTimeout(() => {
      const prevItemHtml = this.elements?.toArray()[indexPrev];
      prevItemHtml.setFocusToEnd();
    });
    this.postAction();
  }

  getTextContent(index: number): BaseText {
    return this.contents[index] as BaseText;
  }

  transformToTypeText(value: TransformContent) {
    const index = this.contentEditorTextService.tranformTextContentTo(value);
    setTimeout(() => this.elements?.toArray()[index].setFocusToEnd());
    this.postAction();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHtmlHandler(model: InputHtmlEvent) {
    const delta = DeltaConverter.convertHTMLToDelta(model.html);
    model.content.contents = DeltaConverter.convertToTextBlocks(delta);
    this.postAction();
  }

  updateTextStyles = (styles: UpdateTextStyles) => {
    const el = this.elements.toArray().find((x) => x.getContent() === styles.content);
    if (!el) {
      return;
    }
    const textBlocks = DeltaConverter.convertToDelta(styles.content.contents);
    const html = DeltaConverter.convertDeltaToHtml(textBlocks);
    const pos = this.apiBrowserFunctions.getSelectionCharacterOffsetsWithin(el.getEditableNative());
    const resultDelta = DeltaConverter.setStyles(
      html,
      pos.start,
      pos.end - pos.start,
      styles.textStyle,
      styles.updateMode === UpdateStyleMode.Add,
    );
    if (el) {
      el.updateHTML(DeltaConverter.convertToTextBlocks(resultDelta));
    }
  };

  changeDetectionChecker = () => {
    console.log('Check contents');
  };

  drop(event: CdkDragDrop<ContentModelBase[]>) {
    moveItemInArray(this.contents, event.previousIndex, event.currentIndex);
    this.postAction();
  }

  dragStarted = (event: CdkDragStart) => {
    console.log(event);
  };

  dragEnded = (event: CdkDragEnd) => {
    console.log(event);
  };

  postAction(): void {
    const native = this.elements?.last?.getEditableNative();
    if (native?.textContent.length !== 0) {
      this.contentEditorTextService.appendNewEmptyContentToEnd();
    }
    this.contentEditorContentsService.changeAndSave();
  }

  placeHolderClick($event) {
    $event.preventDefault();
    if (this.elements?.last.getContent().typeId !== ContentTypeENUM.Text) {
      this.contentEditorTextService.appendNewEmptyContentToEnd();
    }
    this.contentEditorContentsService.changeAndSave();
    setTimeout(() => this.elements?.last?.setFocus());
  }

  mouseEnter($event) {
    this.elements?.last?.mouseEnter($event);
  }

  mouseOut($event) {
    this.elements?.last?.mouseLeave($event);
  }

  // eslint-disable-next-line class-methods-use-this
  async uploadRandomFiles(files: File[], index: number, contentId: string) {
    const formats = files.map((x) => `.${x.name.split('.').pop()}`);
    const photosFormats = TypeUploadFormats.photos.split(',');
    const audiosFormats = TypeUploadFormats.audios.split(',');
    const videosFormats = TypeUploadFormats.videos.split(',');
    const documentsFormats = TypeUploadFormats.documents.split(',');
    if (formats.every((z) => photosFormats.some((x) => x === z))) {
      const cont = this.contentEditorPhotosService.insertNewCollection(
        contentId,
        false,
        AudiosCollection.getNew(),
      );
      this.postAction();
      await this.contentEditorPhotosService.uploadPhotoToAlbumHandler(
        { contentId: cont.content.id, files },
        this.note.id,
      );
    }
    if (formats.every((z) => audiosFormats.some((x) => x === z))) {
      const cont = this.contentEditorAudiosService.insertNewCollection(
        contentId,
        false,
        AudiosCollection.getNew(),
      );
      this.postAction();
      await this.contentEditorAudiosService.uploadAudiosToCollectionHandler(
        { contentId: cont.content.id, files },
        this.note.id,
      );
    }
    if (formats.every((z) => videosFormats.some((x) => x === z))) {
      const cont = this.contentEditorVideosService.insertNewCollection(
        contentId,
        false,
        VideosCollection.getNew(),
      );
      this.postAction();
      await this.contentEditorVideosService.uploadVideosToCollectionHandler(
        { contentId: cont.content.id, files },
        this.note.id,
      );
    }
    if (formats.every((z) => documentsFormats.some((x) => x === z))) {
      const cont = this.contentEditorDocumentsService.insertNewCollection(
        contentId,
        false,
        DocumentsCollection.getNew(),
      );
      this.postAction();
      await this.contentEditorDocumentsService.uploadDocumentsToCollectionHandler(
        { contentId: cont.content.id, files },
        this.note.id,
      );
    }
    this.postAction();
  }

  // FILE CONTENTS

  // eslint-disable-next-line class-methods-use-this
  async transformToFileType(event: TransformToFileContent) {
    switch (event.typeFile) {
      case TypeUploadFile.photos: {
        await this.contentEditorPhotosService.transformToPhotosCollection(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.audios: {
        await this.contentEditorAudiosService.transformToAudiosCollection(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.documents: {
        await this.contentEditorDocumentsService.transformToDocumentsCollection(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.videos: {
        await this.contentEditorVideosService.transformToVideosCollection(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      default: {
        throw new Error('incorrect type');
      }
    }
  }

  // VIDEOS
  deleteVideosCollection(contentId: string) {
    this.contentEditorVideosService.deleteContentHandler(contentId);
    this.postAction();
  }

  deleteVideoHandler(videoId: string, collection: VideosCollection) {
    this.contentEditorVideosService.deleteVideoHandler(videoId, collection);
    this.postAction();
  }

  uploadVideosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.contentEditorVideosService.uploadVideosToCollectionHandler($event, noteId);
    this.postAction();
  };

  // DOCUMENTS
  deleteDocumentsCollection(contentId: string) {
    this.contentEditorDocumentsService.deleteContentHandler(contentId);
    this.postAction();
  }

  deleteDocumentHandler(documentId: string, collection: DocumentsCollection) {
    this.contentEditorDocumentsService.deleteDocumentHandler(documentId, collection);
    this.postAction();
  }

  uploadDocumentsToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.contentEditorDocumentsService.uploadDocumentsToCollectionHandler($event, noteId);
    this.postAction();
  };

  // AUDIOS
  deleteAudiosCollection(contentId: string) {
    this.contentEditorAudiosService.deleteContentHandler(contentId);
    this.postAction();
  }

  deleteAudioHandler(audioId: string, collection: AudiosCollection) {
    this.contentEditorAudiosService.deleteAudioHandler(audioId, collection);
    this.postAction();
  }

  uploadAudiosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.contentEditorAudiosService.uploadAudiosToCollectionHandler($event, noteId);
    this.postAction();
  };

  // PHOTOS
  deletePhotosCollection(contentId: string) {
    this.contentEditorPhotosService.deleteContentHandler(contentId);
    this.postAction();
  }

  deletePhotoHandler(photoId: string, collection: PhotosCollection) {
    this.contentEditorPhotosService.deletePhotoHandler(photoId, collection);
    this.postAction();
  }

  uploadPhotoToAlbumHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.contentEditorPhotosService.uploadPhotoToAlbumHandler($event, noteId);
    this.postAction();
  };
}
