/* eslint-disable no-param-reassign */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import { SelectionDirective } from '../directives/selection.directive';
import { MenuSelectionDirective } from '../directives/menu-selection.directive';
import { EnterEvent } from '../models/enter-event.model';
import { ParentInteraction, ParentInteractionHTML } from '../models/parent-interaction.interface';
import { TransformContent } from '../models/transform-content.model';
import { ContentEditorContentsService } from '../content-editor-services/core/content-editor-contents.service';
import { ContentEditorPhotosCollectionService } from '../content-editor-services/file-content/content-editor-photos.service';
import { ContentEditorDocumentsCollectionService } from '../content-editor-services/file-content/content-editor-documents.service';
import { ContentEditorVideosCollectionService } from '../content-editor-services/file-content/content-editor-videos.service';
import { ContentEditorAudiosCollectionService } from '../content-editor-services/file-content/content-editor-audios.service';
import { ContentEditorElementsListenerService } from '../content-editor-services/content-editor-elements-listener.service';
import { ContentEditorListenerService } from '../content-editor-services/content-editor-listener.service';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { BaseText } from '../../models/editor-models/base-text';
import { InputHtmlEvent } from '../full-note-components/html-components/models/input-html-event';
import { UpdateTextStyles } from '../../models/update-text-styles';
import { DeltaConverter } from './converter/delta-converter';
import { WebSocketsNoteUpdaterService } from '../content-editor-services/web-sockets-note-updater.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { DeltaStatic } from 'quill';
import { TextEditMenuEnum } from '../text-edit-menu/models/text-edit-menu.enum';
import { TextEditMenuOptions } from '../text-edit-menu/models/text-edit-menu-options';
import { HtmlPropertyTagCollectorService } from '../content-editor-services/html-property-tag-collector.service';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { EditorFacadeService } from '../content-editor-services/editor-facade.service';
import { Label } from 'src/app/content/labels/models/label.model';
import { HtmlComponentsFacadeService } from '../full-note-components/html-components-services/html-components.facade.service';
import { ChangePositionAction } from '../content-editor-services/models/undo/change-position-action';
import { UpdateContentPosition } from 'src/app/core/models/signal-r/innerNote/update-content-position-ws';
import { ContentEditorMomentoStateService } from '../content-editor-services/core/content-editor-momento-state.service';
import { ContentUpdateWsService } from '../content-editor-services/content-update-ws.service';
import { ContentEditorSyncService } from '../content-editor-services/core/content-editor-sync.service';
import { ContentEditorRestoreService } from '../content-editor-services/core/content-editor-restore.service';
import { ContentEditorTextService } from '../content-editor-services/text-content/content-editor-text.service';
import { UpdateTextTypeAction } from '../content-editor-services/models/undo/update-text-type-action';
import { RestoreTextAction } from '../content-editor-services/models/undo/restore-text-action';
import { EditorCollectionsComponent } from '../content-editor-components/editor-collections.component';
import { NoteStore } from '../../state/notes-state';
import { SaveSelection } from '../../models/browser/save-selection';
import { ClearCursorsAction, UpdateCursorAction } from '../../state/editor-actions';
import { UpdateCursor } from '../models/cursors/cursor';
import { ClickableContentService } from '../content-editor-services/clickable-content.service';
import { AudioService } from '../../audio.service';
import { MurriService } from 'src/app/shared/services/murri.service';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss'],
  providers: [
    WebSocketsNoteUpdaterService,
    EditorFacadeService,
    DestroyComponentService,
    HtmlComponentsFacadeService,
    ContentEditorMomentoStateService,
    ContentEditorContentsService,
    ContentEditorAudiosCollectionService,
    ContentEditorDocumentsCollectionService,
    ContentEditorPhotosCollectionService,
    ContentEditorVideosCollectionService,
    ContentUpdateWsService,
    ContentEditorSyncService,
    ContentEditorRestoreService,
    ContentEditorTextService,
    ClickableContentService,
    ContentEditorListenerService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentEditorComponent
  extends EditorCollectionsComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild(SelectionDirective) selectionDirective: SelectionDirective;

  @ViewChild(MenuSelectionDirective) menuSelectionDirective: MenuSelectionDirective;

  @ViewChild('textEditMenu', { read: ElementRef, static: false })
  textEditMenu: ElementRef<HTMLElement>;

  @ViewChild('mainSection', { read: ElementRef }) mainSection: ElementRef<HTMLElement>;

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

  ngForSubject = new Subject<void>(); // for lazy loading

  constructor(
    private contentEditorElementsListenersService: ContentEditorElementsListenerService,
    private contentEditorListenerService: ContentEditorListenerService,
    private webSocketsUpdaterService: WebSocketsNoteUpdaterService,
    public pS: PersonalizationService,
    private htmlPTCollectorService: HtmlPropertyTagCollectorService,
    editorApiFacadeService: EditorFacadeService,
    public audioService: AudioService,
    private muuriService: MurriService
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
        this.mainSection.nativeElement.scrollTop
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
    return this.facade.contentsService.getContents;
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
      this.facade.contentsService.initOnlyRead(contents, this.progressiveLoading);
    } else {
      this.facade.contentsService.initEdit(contents, this.progressiveLoading);
      this.facade.contentEditorSyncService.initEdit(this.noteId);
    }

    if (contents.length === 0) {
      this.facade.contentEditorTextService.appendNewEmptyContentToEnd();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.noteId && changes.noteId.currentValue !== changes.noteId.previousValue) {
      this.titleInited = false;
    }
  }

  ngAfterViewInit(): void {
    this.contentEditorElementsListenersService.setHandlers(this.elementsQuery);
    this.contentEditorListenerService.setHandlers(this.elementsQuery, this.noteTitleEl);
    this.webSocketsUpdaterService.tryJoinToNote(this.noteId);
    this.selectionDirective.initSelectionDrawer(this.mainSection.nativeElement);
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
    this.muuriService.resetToDefaultOpacity();
    this.webSocketsUpdaterService.leaveNote(this.noteId);
    this.contentEditorElementsListenersService.destroysListeners();
    this.contentEditorListenerService.destroysListeners();
    this.facade.store.dispatch(ClearCursorsAction);
    this.resetCursor();
  }

  ngOnInit(): void {
    this.initTitle();
    this.subscribeOnButtons();
    this.facade.contentUpdateWsService.noteId = this.noteId;

    this.ngForSubject.pipe(takeUntil(this.facade.dc.d$)).subscribe(() => {
      this.facade.cdr.detectChanges();
    });

    this.facade.contentsService.onProgressiveAdding
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        this.facade.cdr.detectChanges();
      });

    this.facade.contentUpdateWsService.changes$.pipe(takeUntil(this.facade.dc.d$)).subscribe(() => {
      this.facade.cdr.detectChanges();
    });
  }

  subscribeOnButtons(): void {
    if (this.isReadOnlyMode) {
      return;
    }
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
        this.facade.apiBrowser.removeAllRanges();
        const ids = this.contents.map((x) => x.id);
        this.facade.selectionService.selectItems(ids);
        this.facade.cdr.detectChanges();
      });

    this.contentEditorElementsListenersService.onPressCtrlZSubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        const updateTitleFunc = (title: string) => {
          this.setTitle(title);
          this.pushChangesToTitle(title, false);
        };
        const ids = this.facade.contentEditorRestoreService.restorePrev(updateTitleFunc);
        for (const id of ids) {
          const el = this.getElementById(id);
          if (el) {
            el.syncLayoutWithContent();
            el.detectChanges();
          }
        }
        this.facade.cdr.detectChanges();
      });

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
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFocusHandler(content: ParentInteraction<ContentModelBase>): void {
    this.facade.clickableContentService.prevItem?.detectChanges();
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
      el.updateContentsAndSync(contents);
      el.setFocus();
    });
  }

  deleteRowHandler(id: string) {
    const res = this.facade.contentsService.getContentAndIndexById<BaseText>(id);
    const action = new RestoreTextAction(res.content, res.index);
    this.facade.momentoStateService.saveToStack(action);
    const index = this.facade.contentsService.deleteContent(id);
    if (index !== 0) {
      this.elements[index - 1].setFocusToEnd();
    }
    this.postAction();
  }

  concatThisWithPrev(el: ParentInteractionHTML) {
    const id = el.getContentId();
    const data = this.facade.contentsService.getContentAndIndexById<BaseText>(id);
    const indexPrev = data.index - 1;
    const prevContent = this.facade.contentsService.getContentByIndex<BaseText>(indexPrev);

    const prevElement = this.getHTMLElementById(prevContent.id);

    if (!prevElement) {
      return;
    }

    const resContent = [...prevElement.getTextBlocks(), ...el.getTextBlocks()];

    prevElement.updateContentsAndSync(resContent);
    el.syncHtmlWithLayout();
    this.facade.contentsService.deleteById(id, false);

    setTimeout(() => {
      prevElement.setFocusToEnd();
    });
    this.postAction();
  }

  getTextContent(index: number): BaseText {
    return this.contents[index] as BaseText;
  }

  getNumberList(content: BaseText, contentIndex: number): number {
    const prev = this.getTextContent(contentIndex - 1);
    if (!prev || prev.noteTextTypeId !== NoteTextTypeENUM.numberList) {
      content.listNumber = 1;
      return content.listNumber;
    }
    content.listNumber = prev.listNumber + 1;
    return content.listNumber;
  }

  transformToTypeText(value: TransformContent): void {
    const content = this.getHTMLElementById(value.contentId);
    if (!content) return;
    const c = content.getContent();
    const action = new UpdateTextTypeAction(c.id, c.noteTextTypeId, c.headingTypeId);
    this.facade.momentoStateService.saveToStack(action);
    const selection = content.getSelection();
    this.unSelectItems();
    this.facade.contentEditorTextService.transformTextContentTo(value);
    this.facade.cdr.detectChanges();
    if (selection) {
      selection.start = selection.end;
      const el = this.getHTMLElementById(content.getContentId());
      requestAnimationFrame(() => el.restoreSelection(selection));
    }
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
        el.updateContentsAndSync(DeltaConverter.convertDeltaToTextBlocks(resultDelta));
        el.syncHtmlWithLayout();
      }
      if (pos.selection) {
        pos.selection.start = pos.selection.end;
        requestAnimationFrame(() => el.restoreSelection(pos.selection));
      }
    }
    this.unSelectItems();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHtmlHandler(model: InputHtmlEvent): void {
    this.postAction();
    this.menuSelectionDirective.onSelectionchange(true);
  }

  unSelectItems(): void {
    this.facade.selectionService.resetSelectionAndItems();
  }

  onReset(): void {
    this.facade.clickableContentService.cursorChanged$.next(() => this.resetCursor());
  }

  resetCursor(): void {
    if (!this.noteId) return;
    const color = this.facade.store.selectSnapshot(NoteStore.cursorColor);
    const cursor = new UpdateCursor(color).initNoneCursor();
    this.facade.store.dispatch(new UpdateCursorAction(this.noteId, cursor));
  }

  getIndexAndLengthForUpdateStyle(
    el: HTMLElement | Element,
    menuType: TextEditMenuEnum,
  ): { index: number; length: number; selection: SaveSelection } {
    if (menuType === TextEditMenuEnum.OneRow) {
      const selection = this.facade.apiBrowser.getSelectionInfo(el);
      return { index: selection.start, length: selection.end - selection.start, selection };
    }
    if (menuType === TextEditMenuEnum.MultiplyRows) {
      return { index: 0, length: el.innerHTML.length, selection: null };
    }
    return null;
  }

  changeDetectionChecker = () => {
    // console.log('Check contents');
  };

  drop(event: CdkDragDrop<ContentModelBase[]>) {
    const positions = this.contents.map(
      (x, i) => ({ contentId: x.id, order: i } as UpdateContentPosition),
    );
    const action = new ChangePositionAction(positions);
    this.facade.momentoStateService.saveToStack(action);
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
}
