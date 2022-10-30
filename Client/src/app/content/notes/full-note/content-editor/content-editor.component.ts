/* eslint-disable no-param-reassign */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, take, takeUntil } from 'rxjs/operators';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { HtmlTitleService } from 'src/app/core/html-title.service';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import { FullNote } from '../../models/full-note.model';
import { UpdateNoteTitle } from '../../state/notes-actions';
import { SelectionDirective } from '../directives/selection.directive';
import { MenuSelectionDirective } from '../directives/menu-selection.directive';
import { EnterEvent } from '../models/enter-event.model';
import { TypeUploadFile } from '../models/enums/type-upload-file.enum';
import { NoteSnapshot } from '../models/history/note-snapshot.model';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { TransformContent } from '../models/transform-content.model';
import { TransformToFileContent } from '../models/transform-file-content.model';
import { SelectionService } from '../content-editor-services/selection.service';
import { ContentEditorContentsService } from '../content-editor-services/core/content-editor-contents.service';
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
import { BaseText } from '../../models/editor-models/base-text';
import { InputHtmlEvent } from '../full-note-components/html-components/models/input-html-event';
import { UpdateTextStyles } from '../../models/update-text-styles';
import { DeltaConverter } from './converter/delta-converter';
import { WebSocketsNoteUpdaterService } from '../content-editor-services/web-sockets-note-updater.service';
import { VideosCollection } from '../../models/editor-models/videos-collection';
import { DocumentsCollection } from '../../models/editor-models/documents-collection';
import { AudiosCollection } from '../../models/editor-models/audios-collection';
import { PhotosCollection } from '../../models/editor-models/photos-collection';
import { DiffCheckerService } from './diffs/diff-checker.service';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { ContentUpdateWsService } from '../content-editor-services/content-update-ws.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { ClickableContentService } from '../content-editor-services/clickable-content.service';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { ContentEditorSyncService } from '../content-editor-services/core/content-editor-sync.service';
import { ContentEditorRestoreService } from '../content-editor-services/core/content-editor-restore.service';
import { PasteEvent } from '../full-note-components/html-components/html-base.component';
import { HeadingTypeENUM } from '../../models/editor-models/text-models/heading-type.enum';
import { DeltaStatic } from 'quill';
import { TextEditMenuEnum } from '../text-edit-menu/models/text-edit-menu.enum';
import { TextEditMenuOptions } from '../text-edit-menu/models/text-edit-menu-options';
import { HtmlPropertyTagCollectorService } from '../content-editor-services/html-property-tag-collector.service';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss'],
  providers: [WebSocketsNoteUpdaterService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('htmlComp', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(SelectionDirective) selectionDirective: SelectionDirective;

  @ViewChild(MenuSelectionDirective) menuSelectionDirective: MenuSelectionDirective;

  @ViewChild('noteTitle', { read: ElementRef }) noteTitleEl: ElementRef<HTMLElement>;

  @ViewChild('textEditMenu', { read: ElementRef, static: false })
  textEditMenu: ElementRef<HTMLElement>;

  @ViewChild('contentSection', { read: ElementRef }) contentSection: ElementRef<HTMLElement>;

  @Input()
  isReadOnlyMode = true;

  @Input()
  editorTheme: ThemeENUM;

  @Input()
  title$: Observable<string>;

  @Input() progressiveLoading = false;

  elements: QueryList<ParentInteraction>;

  title: string;

  uiTitle: string;

  _note: FullNote | NoteSnapshot;

  noteTitleChanged: Subject<string> = new Subject<string>(); // CHANGE

  theme = ThemeENUM;

  contentType = ContentTypeENUM;

  textType = NoteTextTypeENUM;

  options: TextEditMenuOptions;

  destroy = new Subject<void>();

  isOverEmpty = false;

  ngForSubject = new Subject<void>();

  constructor(
    public selectionService: SelectionService,
    private apiBrowserFunctions: ApiBrowserTextService,
    private store: Store,
    public contentEditorContentsService: ContentEditorContentsService,
    public contentEditorPhotosService: ContentEditorPhotosCollectionService,
    public contentEditorDocumentsService: ContentEditorDocumentsCollectionService,
    public contentEditorVideosService: ContentEditorVideosCollectionService,
    public contentEditorAudiosService: ContentEditorAudiosCollectionService,
    public contentEditorTextService: ContentEditorTextService,
    private contentEditorElementsListenersService: ContentEditorElementsListenerService,
    private contentEditorListenerService: ContentEditorListenerService,
    private htmlTitleService: HtmlTitleService,
    private webSocketsUpdaterService: WebSocketsNoteUpdaterService,
    private diffCheckerService: DiffCheckerService,
    private contentUpdateWsService: ContentUpdateWsService,
    public pS: PersonalizationService,
    public clickableContentService: ClickableContentService,
    private contentEditorSyncService: ContentEditorSyncService,
    private contentEditorRestoreService: ContentEditorRestoreService,
    private cdr: ChangeDetectorRef,
    private htmlPTCollectorService: HtmlPropertyTagCollectorService,
  ) {}

  get isSelectModeActive(): boolean {
    const isAnySelect = this.selectionService.isAnySelect();
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
    return this.selectionService.selectedMenuType;
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
      map((x) => x === true && this.clickableContentService.isEmptyTextItemFocus),
    );
  }

  get textEditMenuTop(): number {
    if (this.selectedMenuType === TextEditMenuEnum.OneRow) {
      return (
        this.selectionService.getCursorTop -
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
      return this.selectionService.getCursorLeft;
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
    return this.selectedElements?.map((x) => x.getHost().nativeElement.getBoundingClientRect());
  }

  get selectedTextElements(): BaseText[] {
    return this.selectedElements
      ?.filter((x) => x.getContent().typeId === ContentTypeENUM.Text)
      .map((x) => x.getContent() as BaseText);
  }

  get selectedTextElement(): BaseText {
    return this.selectedTextElements.length > 0 ? this.selectedTextElements[0] : null;
  }

  get selectedElements(): ParentInteraction[] {
    return this.elements?.filter((x) => this.selectionService.isSelectedAll(x.getContentId()));
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  @Input() set contents(contents: ContentModelBase[]) {
    if (this.isReadOnlyMode) {
      this.contentEditorContentsService.initOnlyRead(contents, this.progressiveLoading);
    } else {
      this.contentEditorContentsService.initEdit(contents, this.progressiveLoading);
      this.contentEditorRestoreService.initEdit();
      this.contentEditorSyncService.initEdit(this.note.id);
    }

    if (contents.length === 0) {
      this.contentEditorTextService.appendNewEmptyContentToEnd();
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get note() {
    // eslint-disable-next-line no-underscore-dangle
    return this._note;
  }

  @Input() set note(note: FullNote | NoteSnapshot) {
    // eslint-disable-next-line no-underscore-dangle
    this._note = note;
    this.contentUpdateWsService.noteId = note.id;
  }

  @ViewChildren('htmlComp') set elementsSet(elms: QueryList<ParentInteraction>) {
    this.elements = elms;
    this.contentUpdateWsService.elements = elms;
  }

  ngAfterViewInit(): void {
    this.contentEditorElementsListenersService.setHandlers(this.elements);
    this.contentEditorListenerService.setHandlers(
      this.elements,
      this.noteTitleEl,
      this.contentSection,
    );
    this.webSocketsUpdaterService.tryJoinToNote(this.note.id);
    this.selectionDirective.initSelectionDrawer(this.contentSection.nativeElement);
    this.selectionService.onSelectChanges$.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.options = this.buildMenuOptions();
      this.cdr.detectChanges();
    });
  }

  buildMenuOptions(): TextEditMenuOptions {
    const obj: TextEditMenuOptions = {
      isBold: this.htmlPTCollectorService.getIsBold(this.selectedMenuType, this.selectedElements),
      isItalic: this.htmlPTCollectorService.getIsItalic(
        this.selectedMenuType,
        this.selectedElements,
      ),
      ids: this.selectionService.getAllSelectedItems(),
      textType: this.selectedTextElement?.noteTextTypeId,
      headingType: this.selectedTextElement?.headingTypeId,
      isOneRowType: this.selectedMenuType === TextEditMenuEnum.OneRow,
      backgroundColor: this.htmlPTCollectorService.getProperty(
        'backgroundColor',
        this.selectedMenuType,
        this.selectedElements,
      ),
      color: this.htmlPTCollectorService.getProperty(
        'color',
        this.selectedMenuType,
        this.selectedElements,
      ),
    };
    return obj;
  }

  ngOnDestroy(): void {
    this.selectionService.resetSelectionAndItems();
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
    this.title$
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((title) => this.updateTitle(title));

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
      const el = this.noteTitleEl.nativeElement;
      const data = this.apiBrowserFunctions.saveRangePositionTextOnly(el);

      this.uiTitle = title;
      this.title = title;

      requestAnimationFrame(() => this.apiBrowserFunctions.setCaretFirstChild(el, data));

      this.htmlTitleService.setCustomOrDefault(title, 'titles.note');
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
        this.cdr.detectChanges();
      });

    this.contentEditorElementsListenersService.onPressCtrlZSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.contentEditorRestoreService.restorePrev());

    this.contentEditorElementsListenersService.onPressCtrlSSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.contentEditorSyncService.changeImmediately());

    this.contentEditorListenerService.onPressEnterSubject
      .pipe(takeUntil(this.destroy))
      .subscribe((contentId: string) => {
        if (contentId) {
          this.enterHandler({
            breakModel: { isFocusToNext: true },
            nextItemType: NoteTextTypeENUM.default,
            contentId,
          });
        }
      });

    this.ngForSubject.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.cdr.detectChanges();
    });

    this.contentEditorContentsService.onProgressiveAdding
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFocusHandler(content: ParentInteraction): void {
    this.clickableContentService.prevItem?.detectChanges();
  }

  pasteCommandHandler(e) {
    this.apiBrowserFunctions.pasteOnlyTextHandler(e);
    this.noteTitleChanged.next(this.noteTitleEl.nativeElement.innerText);
  }

  getElementById(id: string): ParentInteraction {
    return this.elements.find((q) => q.getContentId() === id);
  }

  selectionHandler(secondRect: DOMRect) {
    this.selectionService.selectionHandler(
      secondRect,
      this.elements,
      this.selectionDirective.isDivTransparent,
    );
  }

  selectionStartHandler($event: DOMRect): void {
    const isSelectionInZone = this.selectionService.isSelectionInZone(
      $event,
      this.elements,
      this.noteTitleEl,
    );
    this.selectionDirective.setIsShowDiv(!isSelectionInZone);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectionEndHandler($event: DOMRect): void {
    if (!this.isSelectModeActive) return;
    this.apiBrowserFunctions.removeAllRanges();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onScroll($event: Event): void {}

  enterHandler(value: EnterEvent) {
    const curEl = this.elements?.toArray().find((x) => x.getContentId() === value.contentId);
    curEl.syncHtmlWithLayout();
    const newTextContent = this.contentEditorTextService.insertNewContent(
      value.contentId,
      value.nextItemType,
      value.breakModel.isFocusToNext,
    );
    this.cdr.detectChanges();
    setTimeout(() => {
      const el = this.elements?.toArray()[newTextContent.index];
      const contents = DeltaConverter.convertHTMLToTextBlocks(value.breakModel.nextHtml);
      el.updateHTML(contents);
      el.setFocus();
    });
  }

  deleteRowHandler(id: string) {
    const index = this.contentEditorContentsService.deleteContent(id);
    if (index !== 0) {
      this.elements?.toArray()[index - 1].setFocusToEnd();
    }
    this.postAction();
  }

  concatThisWithPrev(id: string) {
    const data = this.contentEditorContentsService.getContentAndIndexById<BaseText>(id);
    const indexPrev = data.index - 1;

    const prevContent = this.contentEditorContentsService.getContentByIndex<BaseText>(indexPrev);

    const currentElement = this.getElementById(id);
    const prevElement = this.getElementById(prevContent.id);

    const resContent = [...prevElement.getTextBlocks(), ...currentElement.getTextBlocks()];

    const prevRef = this.elements.find((q) => q.getContentId() === prevContent.id);
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

  transformToTypeText(value: TransformContent): void {
    this.unSelectItems();
    const index = this.contentEditorTextService.transformTextContentTo(value);
    setTimeout(() => this.elements?.toArray()[index].setFocusToEnd());
    this.postAction();
  }

  updateTextStyles = (updates: UpdateTextStyles) => {
    for (const id of updates.ids) {
      const el = this.elements.toArray().find((x) => x.getContent().id === id);
      if (!el) {
        this.unSelectItems();
        return;
      }
      const content = el.getContent() as BaseText;
      const html = DeltaConverter.convertTextBlocksToHTML(content.contents);
      const pos = this.getIndexAndLengthForUpdateStyle(el.getEditableNative());
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
    this.selectionService.resetSelectionAndItems();
  }

  getIndexAndLengthForUpdateStyle(el: HTMLElement | Element): { index: number; length: number } {
    if (this.selectedMenuType === TextEditMenuEnum.OneRow) {
      const pos = this.apiBrowserFunctions.getSelectionCharacterOffsetsWithin(el);
      return { index: pos.start, length: pos.end - pos.start };
    }
    if (this.selectedMenuType === TextEditMenuEnum.MultiplyRows) {
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
      const newTextContent = this.contentEditorTextService.insertNewContent(
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

  isCanAddNewItem(content: ContentModelBase) {
    if (!content) return true;
    if (content.typeId !== ContentTypeENUM.Text) {
      return true;
    }
    const text = content as BaseText;
    if (text.noteTextTypeId !== NoteTextTypeENUM.default) {
      return true;
    }
    if (text.contents && text.contents?.length !== 0) {
      return true;
    }
    return false;
  }

  postAction(): void {
    if (this.isReadOnlyMode) {
      return;
    }
    const isCanAppend = this.isCanAddNewItem(this.elements?.last?.getContent());
    if (isCanAppend) {
      this.contentEditorTextService.appendNewEmptyContentToEnd();
    }
    this.contentEditorSyncService.change();
    this.contentEditorRestoreService.save();
  }

  placeHolderClick($event) {
    if (this.isReadOnlyMode) {
      return;
    }
    $event.preventDefault();
    this.postAction();
    requestAnimationFrame(() => this.elements?.last?.setFocus());
  }

  mouseEnter($event): void {
    this.elements?.last?.mouseEnter($event);
    this.elements?.last?.detectChanges();
  }

  mouseOut($event): void {
    this.elements?.last?.mouseLeave($event);
    this.elements?.last?.detectChanges();
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
    this.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        await this.contentEditorPhotosService.uploadPhotosToCollectionHandler(
          { contentId: cont.content.id, files },
          this.note.id,
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
    this.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        await this.contentEditorAudiosService.uploadAudiosToCollectionHandler(
          { contentId: cont.content.id, files },
          this.note.id,
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
    this.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        await this.contentEditorVideosService.uploadVideosToCollectionHandler(
          { contentId: cont.content.id, files },
          this.note.id,
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
    this.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        await this.contentEditorDocumentsService.uploadDocumentsToCollectionHandler(
          { contentId: cont.content.id, files },
          this.note.id,
        );
        this.syncCollectionItems(cont.content.id);
        this.postAction();
      });
  }

  // FILE CONTENTS

  // eslint-disable-next-line class-methods-use-this
  async transformToFileType(event: TransformToFileContent) {
    this.selectionService.resetSelectionItems();
    let newContentId: string;
    switch (event.typeFile) {
      case TypeUploadFile.photos: {
        newContentId = await this.contentEditorPhotosService.transformToPhotosCollection(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.audios: {
        newContentId = await this.contentEditorAudiosService.transformToAudiosCollection(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.documents: {
        newContentId = await this.contentEditorDocumentsService.transformToDocumentsCollection(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.videos: {
        newContentId = await this.contentEditorVideosService.transformToVideosCollection(
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

    this.cdr.detectChanges();

    if (newContentId) {
      const el = this.elements.toArray().find((x) => x.getContentId() === newContentId);
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
    const curEl = this.elements?.toArray().find((x) => x.getContentId() === contentId);
    if (curEl) {
      curEl.syncContentItems();
    }
  }
}
