/* eslint-disable no-param-reassign */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import { SelectionDirective } from '../directives/selection.directive';
import { MenuSelectionDirective } from '../directives/menu-selection.directive';
import { EnterEvent } from '../models/enter-event.model';
import { TypeUploadFile } from '../models/enums/type-upload-file.enum';
import { ParentInteraction, ParentInteractionHTML } from '../models/parent-interaction.interface';
import { TransformContent } from '../models/transform-content.model';
import { TransformToFileContent } from '../models/transform-file-content.model';
import { ContentEditorContentsService } from '../content-editor-services/core/content-editor-contents.service';
import { ContentEditorPhotosCollectionService } from '../content-editor-services/file-content/content-editor-photos.service';
import { ContentEditorDocumentsCollectionService } from '../content-editor-services/file-content/content-editor-documents.service';
import { ContentEditorVideosCollectionService } from '../content-editor-services/file-content/content-editor-videos.service';
import { ContentEditorAudiosCollectionService } from '../content-editor-services/file-content/content-editor-audios.service';
import { ContentEditorElementsListenerService } from '../content-editor-services/content-editor-elements-listener.service';
import { ContentEditorListenerService } from '../content-editor-services/content-editor-listener.service';
import { UploadFileToEntity } from '../models/upload-files-to-entity';
import { TypeUploadFormats } from '../models/enums/type-upload-formats.enum';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { BaseText } from '../../models/editor-models/base-text';
import { InputHtmlEvent } from '../full-note-components/html-components/models/input-html-event';
import { UpdateTextStyles } from '../../models/update-text-styles';
import { DeltaConverter } from './converter/delta-converter';
import { WebSocketsNoteUpdaterService } from '../content-editor-services/web-sockets-note-updater.service';
import { VideosCollection } from '../../models/editor-models/videos-collection';
import { DocumentsCollection } from '../../models/editor-models/documents-collection';
import { AudiosCollection } from '../../models/editor-models/audios-collection';
import { PhotosCollection } from '../../models/editor-models/photos-collection';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { PasteEvent } from '../full-note-components/html-components/html-base.component';
import { HeadingTypeENUM } from '../../models/editor-models/text-models/heading-type.enum';
import { DeltaStatic } from 'quill';
import { TextEditMenuEnum } from '../text-edit-menu/models/text-edit-menu.enum';
import { TextEditMenuOptions } from '../text-edit-menu/models/text-edit-menu-options';
import { HtmlPropertyTagCollectorService } from '../content-editor-services/html-property-tag-collector.service';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { EditorFacadeService } from '../content-editor-services/editor-facade.service';
import { EditorTitleComponent } from '../content-editor-components/editor-title.component';
import { Label } from 'src/app/content/labels/models/label.model';
import { HtmlComponentsFacadeService } from '../full-note-components/html-components-services/html-components.facade.service';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss'],
  providers: [
    WebSocketsNoteUpdaterService,
    EditorFacadeService,
    DestroyComponentService,
    HtmlComponentsFacadeService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentEditorComponent
  extends EditorTitleComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChildren('htmlComp', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(SelectionDirective) selectionDirective: SelectionDirective;

  @ViewChild(MenuSelectionDirective) menuSelectionDirective: MenuSelectionDirective;

  @ViewChild('noteTitle', { read: ElementRef }) noteTitleEl: ElementRef<HTMLElement>;

  @ViewChild('textEditMenu', { read: ElementRef, static: false })
  textEditMenu: ElementRef<HTMLElement>;

  @ViewChild('contentSection', { read: ElementRef }) contentSection: ElementRef<HTMLElement>;

  @Input()
  editorTheme: ThemeENUM;

  @Input()
  color: string;

  @Input()
  labels: Label[] = [];

  @Input() progressiveLoading = false;

  theme = ThemeENUM;

  contentType = ContentTypeENUM;

  textType = NoteTextTypeENUM;

  options: TextEditMenuOptions;

  isOverEmpty = false;

  ngForSubject = new Subject<void>(); // for lazy loading

  constructor(
    public contentEditorContentsService: ContentEditorContentsService,
    public contentEditorPhotosService: ContentEditorPhotosCollectionService,
    public contentEditorDocumentsService: ContentEditorDocumentsCollectionService,
    public contentEditorVideosService: ContentEditorVideosCollectionService,
    public contentEditorAudiosService: ContentEditorAudiosCollectionService,
    private contentEditorElementsListenersService: ContentEditorElementsListenerService,
    private contentEditorListenerService: ContentEditorListenerService,
    private webSocketsUpdaterService: WebSocketsNoteUpdaterService,
    public pS: PersonalizationService,
    private htmlPTCollectorService: HtmlPropertyTagCollectorService,
    editorApiFacadeService: EditorFacadeService,
  ) {
    super(editorApiFacadeService);
  }

  get isSelectModeActive(): boolean {
    const isAnySelect = this.facade.selectionService.isAnySelect();
    const divActive = this.selectionDirective?.isDivActive;
    return isAnySelect || divActive;
  }

  get isHideMenu(): boolean {
    const top = this.textEditMenuTop;
    if (top < 80 && !this.pS.isMobile()) {
      return true;
    }
    return false;
  }

  get selectedMenuType(): TextEditMenuEnum {
    return this.facade.selectionService.selectedMenuType;
  }

  get isTextMenuActive(): boolean {
    return (
      this.selectedMenuType !== null &&
      !this.isHideMenu &&
      !!this.options &&
      this.options.ids?.length > 0
    );
  }

  get isMobileMenuActive$(): Observable<boolean> {
    return this.pS.isTransformMenuMobile$.pipe(
      map((x) => x === true && this.facade.clickableContentService.isEmptyTextItemFocus),
    );
  }

  get textEditMenuTop(): number {
    if (this.selectedMenuType === TextEditMenuEnum.OneRow) {
      return (
        this.facade.selectionService.getCursorTop -
        this.textEditMenu.nativeElement.offsetHeight -
        this.contentSection.nativeElement.scrollTop
      );
    }
    if (this.selectedMenuType === TextEditMenuEnum.MultiplyRows) {
      const top = Math.min(...this.selectedElementsRects.map((x) => x.top));
      return top - this.textEditMenu.nativeElement.offsetHeight;
    }
    return 0;
  }

  get textEditMenuLeft(): number {
    if (this.selectedMenuType === TextEditMenuEnum.OneRow) {
      return this.facade.selectionService.getCursorLeft;
    }
    if (this.selectedMenuType === TextEditMenuEnum.MultiplyRows) {
      return Math.min(...this.selectedElementsRects.map((x) => x.left)) + 150;
    }
    return 0;
  }

  get lastContentId(): string {
    return this.contents[this.contents.length - 1].id;
  }

  get contents(): ContentModelBase[] {
    return this.contentEditorContentsService.getContents;
  }

  get selectedElementsRects(): DOMRect[] {
    return this.getSelectedElements()?.map((x) =>
      x.getHost().nativeElement.getBoundingClientRect(),
    );
  }

  get selectedTextElements(): BaseText[] {
    return this.getSelectedHTMLElements()?.map((x) => x.getContent() as BaseText);
  }

  get selectedTextElement(): BaseText {
    return this.selectedTextElements.length > 0 ? this.selectedTextElements[0] : null;
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  @Input() set contents(contents: ContentModelBase[]) {
    if (this.isReadOnlyMode) {
      this.contentEditorContentsService.initOnlyRead(contents, this.progressiveLoading);
    } else {
      this.contentEditorContentsService.initEdit(contents, this.progressiveLoading);
      this.facade.contentEditorRestoreService.initEdit();
      this.facade.contentEditorSyncService.initEdit(this.noteId);
    }

    if (contents.length === 0) {
      this.facade.contentEditorTextService.appendNewEmptyContentToEnd();
    }
  }

  ngAfterViewInit(): void {
    this.contentEditorElementsListenersService.setHandlers(this.elementsQuery);
    this.contentEditorListenerService.setHandlers(
      this.elementsQuery,
      this.noteTitleEl,
      this.contentSection,
    );
    this.webSocketsUpdaterService.tryJoinToNote(this.noteId);
    this.selectionDirective.initSelectionDrawer(this.contentSection.nativeElement);
    this.facade.selectionService.onSelectChanges$
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        this.options = this.buildMenuOptions();
        this.facade.cdr.detectChanges();
      });
  }

  buildMenuOptions(): TextEditMenuOptions {
    const htmlElements = this.getSelectedHTMLElements();
    const obj: TextEditMenuOptions = {
      isBold: this.htmlPTCollectorService.getIsBold(this.selectedMenuType, htmlElements),
      isItalic: this.htmlPTCollectorService.getIsItalic(this.selectedMenuType, htmlElements),
      ids: this.facade.selectionService.getAllSelectedItems(),
      textType: this.selectedTextElement?.noteTextTypeId,
      headingType: this.selectedTextElement?.headingTypeId,
      isOneRowType: this.selectedMenuType === TextEditMenuEnum.OneRow,
      backgroundColor: this.htmlPTCollectorService.getProperty(
        'backgroundColor',
        this.selectedMenuType,
        htmlElements,
      ),
      color: this.htmlPTCollectorService.getProperty('color', this.selectedMenuType, htmlElements),
    };
    return obj;
  }

  ngOnDestroy(): void {
    this.facade.selectionService.resetSelectionAndItems();
    this.webSocketsUpdaterService.leaveNote(this.noteId);
    this.contentEditorElementsListenersService.destroysListeners();
    this.contentEditorListenerService.destroysListeners();
  }

  ngOnInit(): void {
    this.initTitle();

    this.facade.contentUpdateWsService.noteId = this.noteId;

    this.contentEditorElementsListenersService.onPressDeleteOrBackSpaceSubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        for (const itemId of this.facade.selectionService.getSelectedItems()) {
          this.deleteRowHandler(itemId);
          this.facade.selectionService.removeFromSelectedItems(itemId);
        }
      });

    this.contentEditorElementsListenersService.onPressCtrlASubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        const ids = this.contents.map((x) => x.id);
        this.facade.selectionService.selectItems(ids);
        this.facade.cdr.detectChanges();
      });

    this.contentEditorElementsListenersService.onPressCtrlZSubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => this.facade.contentEditorRestoreService.restorePrev());

    this.contentEditorElementsListenersService.onPressCtrlSSubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => this.facade.contentEditorSyncService.changeImmediately());

    this.contentEditorListenerService.onPressEnterSubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe((contentId: string) => {
        if (contentId) {
          this.enterHandler({
            breakModel: { isFocusToNext: true },
            nextItemType: NoteTextTypeENUM.default,
            contentId,
          });
        }
      });

    this.ngForSubject.pipe(takeUntil(this.facade.dc.d$)).subscribe(() => {
      this.facade.cdr.detectChanges();
    });

    this.contentEditorContentsService.onProgressiveAdding
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        this.facade.cdr.detectChanges();
      });

    this.facade.contentUpdateWsService.changes$.pipe(takeUntil(this.facade.dc.d$)).subscribe(() => {
      this.facade.cdr.detectChanges();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFocusHandler(content: ParentInteraction): void {
    this.facade.clickableContentService.prevItem?.detectChanges();
  }

  pasteCommandHandler(e) {
    this.facade.apiBrowser.pasteOnlyTextHandler(e);
    this.pushChangesToTitle(this.noteTitleEl.nativeElement.innerText);
  }

  selectionHandler(secondRect: DOMRect) {
    this.facade.selectionService.selectionHandler(
      secondRect,
      this.elementsQuery,
      this.selectionDirective.isDivTransparent,
    );
  }

  selectionStartHandler($event: DOMRect): void {
    const isSelectionInZone = this.facade.selectionService.isSelectionInZone(
      $event,
      this.elementsQuery,
      this.noteTitleEl,
    );
    this.selectionDirective.setIsShowDiv(!isSelectionInZone);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectionEndHandler($event: DOMRect): void {
    if (!this.isSelectModeActive) return;
    this.facade.apiBrowser.removeAllRanges();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onScroll($event: Event): void {}

  enterHandler(value: EnterEvent) {
    const curEl = this.getHTMLElementById(value.contentId);
    curEl.syncHtmlWithLayout();
    const newTextContent = this.facade.contentEditorTextService.insertNewContent(
      value.contentId,
      value.nextItemType,
      value.breakModel.isFocusToNext,
    );
    this.facade.cdr.detectChanges();
    setTimeout(() => {
      const el = this.getElementByIndex<ParentInteractionHTML>(newTextContent.index);
      const contents = DeltaConverter.convertHTMLToTextBlocks(value.breakModel.nextHtml);
      el.updateHTML(contents);
      el.setFocus();
    });
  }

  deleteRowHandler(id: string) {
    const index = this.contentEditorContentsService.deleteContent(id);
    if (index !== 0) {
      this.elements[index - 1].setFocusToEnd();
    }
    this.postAction();
  }

  concatThisWithPrev(el: ParentInteractionHTML) {
    const id = el.getContentId();
    const data = this.contentEditorContentsService.getContentAndIndexById<BaseText>(id);
    const indexPrev = data.index - 1;
    const prevContent = this.contentEditorContentsService.getContentByIndex<BaseText>(indexPrev);

    const prevElement = this.getHTMLElementById(prevContent.id);

    if (!prevElement) {
      return;
    }

    const resContent = [...prevElement.getTextBlocks(), ...el.getTextBlocks()];

    prevElement.updateHTML(resContent);
    this.contentEditorContentsService.deleteById(id, false);

    setTimeout(() => {
      prevElement.setFocusToEnd();
    });
    this.postAction();
  }

  getTextContent(index: number): BaseText {
    return this.contents[index] as BaseText;
  }

  transformToTypeText(value: TransformContent): void {
    this.unSelectItems();
    const index = this.facade.contentEditorTextService.transformTextContentTo(value);
    setTimeout(() => this.elements[index].setFocusToEnd());
    this.postAction();
  }

  updateTextStyles = (updates: UpdateTextStyles) => {
    const selectMenuType = this.selectedMenuType;
    const elements = this.getHTMLElementsById(updates.ids);
    for (const el of elements) {
      if (!el) {
        this.unSelectItems();
        return;
      }
      const blocks = el.getTextBlocks();
      const html = DeltaConverter.convertTextBlocksToHTML(blocks);
      if (!html) continue;
      const pos = this.getIndexAndLengthForUpdateStyle(el.getEditableNative(), selectMenuType);
      let resultDelta: DeltaStatic;
      if (updates.isRemoveStyles) {
        resultDelta = DeltaConverter.removeStyles(html, pos.index, pos.length);
      } else {
        resultDelta = DeltaConverter.setStyles(
          html,
          pos.index,
          pos.length,
          updates.textStyle,
          updates.value,
        );
      }
      if (el) {
        el.updateHTML(DeltaConverter.convertDeltaToTextBlocks(resultDelta));
      }
    }
    this.unSelectItems();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHtmlHandler(model: InputHtmlEvent) {
    const contents = DeltaConverter.convertHTMLToTextBlocks(model.html);
    model.content.contents = contents;
    this.postAction();
    this.menuSelectionDirective.onSelectionchange(true);
  }

  unSelectItems(): void {
    this.facade.selectionService.resetSelectionAndItems();
  }

  getIndexAndLengthForUpdateStyle(
    el: HTMLElement | Element,
    menuType: TextEditMenuEnum,
  ): { index: number; length: number } {
    if (menuType === TextEditMenuEnum.OneRow) {
      const pos = this.facade.apiBrowser.getSelectionCharacterOffsetsWithin(el);
      return { index: pos.start, length: pos.end - pos.start };
    }
    if (menuType === TextEditMenuEnum.MultiplyRows) {
      return { index: 0, length: el.innerHTML.length };
    }
    return null;
  }

  pasteTextHandler(e: PasteEvent): void {
    let contentId = e.element.content.id;
    for (const el of e.htmlElementsToInsert) {
      let type = NoteTextTypeENUM.default;
      let heading: HeadingTypeENUM = null;
      if (el.tagName === 'H1' || el.tagName === 'H2') {
        type = NoteTextTypeENUM.heading;
        heading = HeadingTypeENUM.H1;
      }
      if (el.tagName === 'H3' || el.tagName === 'H4') {
        type = NoteTextTypeENUM.heading;
        heading = HeadingTypeENUM.H2;
      }
      if (el.tagName === 'H5' || el.tagName === 'H6') {
        type = NoteTextTypeENUM.heading;
        heading = HeadingTypeENUM.H3;
      }
      if (el.tagName === 'UL') {
        type = NoteTextTypeENUM.dotList;
        if (el.firstElementChild?.textContent?.trimStart().startsWith('[ ]')) {
          el.firstElementChild.textContent = el.firstElementChild?.textContent.slice(3);
          type = NoteTextTypeENUM.checkList;
        }
      }
      if (el.tagName === 'OL') {
        type = NoteTextTypeENUM.numberList;
      }

      const textBlocks = DeltaConverter.convertHTMLToTextBlocks(el.outerHTML);
      const newTextContent = this.facade.contentEditorTextService.insertNewContent(
        contentId,
        type,
        true,
        textBlocks,
        heading,
      );
      contentId = newTextContent.content.id;
    }
  }

  changeDetectionChecker = () => {
    // console.log('Check contents');
  };

  drop(event: CdkDragDrop<ContentModelBase[]>) {
    moveItemInArray(this.contents, event.previousIndex, event.currentIndex);
    this.postAction();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dragStarted = (event: CdkDragStart) => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dragEnded = (event: CdkDragEnd) => {};

  placeHolderClick($event) {
    if (this.isReadOnlyMode) {
      return;
    }
    $event.preventDefault();
    this.postAction();
    requestAnimationFrame(() => {
      this.last?.setFocus();
      this.preLast?.mouseLeave($event);
      this.preLast?.detectChanges();
    });
  }

  mouseEnter($event): void {
    this.last?.mouseEnter($event);
    this.last?.detectChanges();
  }

  mouseOut($event): void {
    this.last?.mouseLeave($event);
    this.last?.detectChanges();
  }

  // eslint-disable-next-line class-methods-use-this
  async uploadRandomFiles(files: File[], contentId: string) {
    this.isOverEmpty = false;
    const formats = files.map((x) => `.${x.name.split('.').pop()}`);
    const photosFormats = TypeUploadFormats.photos.split(',');
    const audiosFormats = TypeUploadFormats.audios.split(',');
    const videosFormats = TypeUploadFormats.videos.split(',');
    const documentsFormats = TypeUploadFormats.documents.split(',');

    if (formats.every((q) => photosFormats.some((x) => x === q))) {
      await this.handleRandomPhotosUpload(contentId, files);
    }
    if (formats.every((q) => audiosFormats.some((x) => x === q))) {
      await this.handleRandomAudiosUpload(contentId, files);
    }
    if (formats.every((q) => videosFormats.some((x) => x === q))) {
      await this.handleRandomVideosUpload(contentId, files);
    }
    if (formats.every((q) => documentsFormats.some((x) => x === q))) {
      await this.handleRandomDocumentsUpload(contentId, files);
    }
    this.postAction();
  }

  async handleRandomPhotosUpload(contentId: string, files: File[]): Promise<void> {
    const cont = this.contentEditorPhotosService.insertNewCollection(
      contentId,
      true,
      PhotosCollection.getNew(),
    );
    const prevId = cont.content.id;
    this.facade.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        await this.contentEditorPhotosService.uploadPhotosToCollectionHandler(
          { contentId: cont.content.id, files },
          this.noteId,
        );
        this.syncCollectionItems(cont.content.id);
        this.postAction();
      });
  }

  async handleRandomAudiosUpload(contentId: string, files: File[]): Promise<void> {
    const cont = this.contentEditorAudiosService.insertNewCollection(
      contentId,
      true,
      AudiosCollection.getNew(),
    );
    const prevId = cont.content.id;
    this.facade.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        await this.contentEditorAudiosService.uploadAudiosToCollectionHandler(
          { contentId: cont.content.id, files },
          this.noteId,
        );
        this.syncCollectionItems(cont.content.id);
        this.postAction();
      });
  }

  async handleRandomVideosUpload(contentId: string, files: File[]): Promise<void> {
    const cont = this.contentEditorVideosService.insertNewCollection(
      contentId,
      true,
      VideosCollection.getNew(),
    );
    const prevId = cont.content.id;
    this.facade.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        await this.contentEditorVideosService.uploadVideosToCollectionHandler(
          { contentId: cont.content.id, files },
          this.noteId,
        );
        this.syncCollectionItems(cont.content.id);
        this.postAction();
      });
  }

  async handleRandomDocumentsUpload(contentId: string, files: File[]): Promise<void> {
    const cont = this.contentEditorDocumentsService.insertNewCollection(
      contentId,
      true,
      DocumentsCollection.getNew(),
    );
    const prevId = cont.content.id;
    this.facade.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        await this.contentEditorDocumentsService.uploadDocumentsToCollectionHandler(
          { contentId: cont.content.id, files },
          this.noteId,
        );
        this.syncCollectionItems(cont.content.id);
        this.postAction();
      });
  }

  // FILE CONTENTS

  // eslint-disable-next-line class-methods-use-this
  async transformToFileType(event: TransformToFileContent) {
    this.facade.selectionService.resetSelectionItems();
    let newContentId: string;
    switch (event.typeFile) {
      case TypeUploadFile.photos: {
        newContentId = await this.contentEditorPhotosService.transformToPhotosCollection(
          this.noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.audios: {
        newContentId = await this.contentEditorAudiosService.transformToAudiosCollection(
          this.noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.documents: {
        newContentId = await this.contentEditorDocumentsService.transformToDocumentsCollection(
          this.noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.videos: {
        newContentId = await this.contentEditorVideosService.transformToVideosCollection(
          this.noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      default: {
        throw new Error('incorrect type');
      }
    }

    this.facade.cdr.detectChanges();

    if (newContentId) {
      const el = this.getElementById(newContentId);
      if (el) {
        el.syncContentWithLayout();
        el.syncContentItems();
      }
    }
    this.postAction();
  }

  // VIDEOS
  deleteVideosCollection(contentId: string) {
    this.contentEditorVideosService.deleteContentHandler(contentId);
    this.postAction();
  }

  deleteVideoHandler(videoId: string, collection: VideosCollection) {
    this.contentEditorVideosService.deleteVideoHandler(videoId, collection);
    this.syncCollectionItems(collection.id);
    this.postAction();
  }

  uploadVideosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.contentEditorVideosService.uploadVideosToCollectionHandler($event, noteId);
    this.syncCollectionItems($event.contentId);
    this.postAction();
  };

  // DOCUMENTS
  deleteDocumentsCollection(contentId: string) {
    this.contentEditorDocumentsService.deleteContentHandler(contentId);
    this.postAction();
  }

  deleteDocumentHandler(documentId: string, collection: DocumentsCollection) {
    this.contentEditorDocumentsService.deleteDocumentHandler(documentId, collection);
    this.syncCollectionItems(collection.id);
    this.postAction();
  }

  uploadDocumentsToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.contentEditorDocumentsService.uploadDocumentsToCollectionHandler($event, noteId);
    this.syncCollectionItems($event.contentId);
    this.postAction();
  };

  // AUDIOS
  deleteAudiosCollection(contentId: string) {
    this.contentEditorAudiosService.deleteContentHandler(contentId);
    this.postAction();
  }

  deleteAudioHandler(audioId: string, collection: AudiosCollection) {
    this.contentEditorAudiosService.deleteAudioHandler(audioId, collection);
    this.syncCollectionItems(collection.id);
    this.postAction();
  }

  uploadAudiosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.contentEditorAudiosService.uploadAudiosToCollectionHandler($event, noteId);
    this.syncCollectionItems($event.contentId);
    this.postAction();
  };

  // PHOTOS
  deletePhotosCollection(contentId: string) {
    this.contentEditorPhotosService.deleteContentHandler(contentId);
    this.postAction();
  }

  deletePhotoHandler(photoId: string, collection: PhotosCollection) {
    this.contentEditorPhotosService.deletePhotoHandler(photoId, collection);
    this.syncCollectionItems(collection.id);
    this.postAction();
  }

  uploadPhotoToAlbumHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.contentEditorPhotosService.uploadPhotosToCollectionHandler($event, noteId);
    this.syncCollectionItems($event.contentId);
    this.postAction();
  };

  syncCollectionItems(contentId: string): void {
    if (!contentId) return;
    const curEl = this.getElementById(contentId);
    if (curEl) {
      curEl.syncContentItems();
    }
  }
}
