import {
  AfterViewInit,
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
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import {
  BaseText,
  ContentModel,
  ContentTypeENUM,
  NoteTextTypeENUM,
} from '../../models/content-model.model';
import { FullNote } from '../../models/full-note.model';
import { UpdateTitle } from '../../state/notes-actions';
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
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss'],
  providers: [ContentEditableService],
})
export class ContentEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('htmlComp') elements: QueryList<ParentInteraction>;

  @ViewChildren('htmlComp', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(SelectionDirective) selectionDirective: SelectionDirective;

  @ViewChild('noteTitle', { read: ElementRef }) noteTitleEl: ElementRef;

  @Input() set contents(contents: ContentModel[]) {
    if(this.isReadOnlyMode){
      this.contentEditorContentsService.initOnlyRead(contents, this.note.id);
    } else {
      this.contentEditorContentsService.init(contents, this.note.id);
    }
  }

  get contents() {
    return this.contentEditorContentsService.getContents;
    // return this.contentEditorContentsService.getContents.sort((a, b) => a.order - b.order); TODO
  }

  @Select(UserStore.getUserTheme)
  theme$: Observable<ThemeENUM>;

  theme = ThemeENUM;

  @Input()
  isReadOnlyMode = true;

  @Input()
  note: FullNote | NoteSnapshot;

  contentType = ContentTypeENUM;

  textType = NoteTextTypeENUM;

  noteTitleChanged: Subject<string> = new Subject<string>(); // CHANGE

  destroy = new Subject<void>();

  constructor(
    public selectionService: SelectionService,
    @Optional() public sliderService: FullNoteSliderService,
    private apiBrowserFunctions: ApiBrowserTextService,
    private store: Store,
    public menuSelectionService: MenuSelectionService,
    public contentEditorContentsService: ContentEditorContentsService,
    public contentEditorAlbumService: ContentEditorPhotosCollectionService,
    public contentEditorDocumentsService: ContentEditorDocumentsCollectionService,
    public contentEditorVideosService: ContentEditorVideosCollectionService,
    public contentEditorPlaylistService: ContentEditorAudiosCollectionService,
    public contentEditorTextService: ContentEditorTextService,
    private contentEditorElementsListenersService: ContentEditorElementsListenerService,
    private contentEditorListenerService: ContentEditorListenerService,
  ) {}

  ngAfterViewInit(): void {
    this.contentEditorElementsListenersService.setHandlers(this.elements);
    this.contentEditorListenerService.setHandlers(this.elements, this.noteTitleEl);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.contentEditorElementsListenersService.destroysListeners();
    this.contentEditorListenerService.destroysListeners();
  }

  ngOnInit(): void {
    this.noteTitleChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((title) => this.store.dispatch(new UpdateTitle(title)));

    this.contentEditorElementsListenersService.onPressDeleteOrBackSpaceSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(x => {
        for(let itemId of this.selectionService.getSelectedItems()){
          this.deleteRowHandler(itemId);
          this.selectionService.removeFromSelectedItems(itemId);
        }
      });

    this.contentEditorElementsListenersService.onPressCtrlZSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.contentEditorContentsService.restorePrev());
  }

  onTitleInput($event) {
    this.noteTitleChanged.next($event.target.innerText);
  }

  handlerTitleEnter($event: KeyboardEvent){
    $event.preventDefault();
    this.contentEditorTextService.appendNewEmptyContentToStart();
    setTimeout(() => this.elements?.first?.setFocus());
    this.postAction();
  }

  pasteCommandHandler(e) {
    this.apiBrowserFunctions.pasteCommandHandler(e);
  }

  selectionHandler(secondRect: DOMRect) {
    this.selectionService.selectionHandler(secondRect, this.elements);
  }

  selectionStartHandler($event: DOMRect) {
    const isSelectionInZone = this.selectionService.isSelectionInZone($event, this.elements);
    if (isSelectionInZone) {
      this.selectionService.isSelectionInside = true;
      this.selectionDirective.div.style.opacity = '0';
    } else {
      this.selectionService.isSelectionInside = false;
      this.selectionDirective.div.style.opacity = '1';
    }
  }

  enterHandler(value: EnterEvent) {
    const index = this.contentEditorTextService.insertNewContent(
      value.contentId,
      value.nextItemType,
      value.breakModel.isFocusToNext,
      value.breakModel.nextText,
    );
    setTimeout(() => this.elements?.toArray()[index].setFocus());
    this.postAction();
  }

  deleteRowHandler(id: string) {
    const index = this.contentEditorTextService.deleteContent(id);
    this.elements?.toArray()[index].setFocusToEnd();
    this.postAction();
  }

  concatThisWithPrev(id: string) {
    const index = this.contentEditorTextService.concatContentWithPrevContent(id);
    setTimeout(() => {
      const prevItemHtml = this.elements?.toArray()[index];
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
  updateTextHandler(content: BaseText) {
    this.postAction();
  }

  postAction(): void {
    const native = this.elements?.last?.getEditableNative();
    if (native?.textContent.length !== 0) {
      this.contentEditorTextService.appendNewEmptyContentToEnd();
    }
    this.contentEditorContentsService.changeAndSave();
  }

  placeHolderClick($event) {
    $event.preventDefault();
    if(this.elements?.last.getContent().typeId !== ContentTypeENUM.Text) {
      this.contentEditorTextService.appendNewEmptyContentToEnd();
    }
    this.contentEditorContentsService.changeAndSave();
    setTimeout(() => this.elements?.last?.setFocus());
  }

  mouseEnter($event) {
    this.elements?.last?.mouseEnter($event);
  }

  mouseOut($event) {
    this.elements?.last?.mouseOut($event);
  }

  // FILE CONTENTS

  // eslint-disable-next-line class-methods-use-this
  async transformToFileType(event: TransformToFileContent) {
    switch (event.typeFile) {
      case TypeUploadFile.photos: {
        await this.contentEditorAlbumService.transformToPhotosCollection(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.audios: {
        await this.contentEditorPlaylistService.transformToAudiosCollection(
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

  async deleteVideosCollection(contentId: string){
    const res = await this.contentEditorVideosService.deleteContentHandler(contentId, this.note.id);
    if(res.success){
      this.postAction();
    }
  }

  async deleteAudiosCollection(contentId: string){
    const res = await this.contentEditorPlaylistService.deleteContentHandler(contentId, this.note.id);
    if(res.success){
      this.postAction();
    }
  }

  async deletePhotosCollection(contentId: string){
    const res = await this.contentEditorAlbumService.deleteContentHandler(contentId, this.note.id);
    if(res.success){
      this.postAction();
    }
  }

  async deleteDocumentsCollection(contentId: string){
    const res = await this.contentEditorDocumentsService.deleteContentHandler(contentId, this.note.id);
    if(res.success){
      this.postAction();
    }
  }
}
