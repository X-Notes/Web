/* eslint-disable no-underscore-dangle */
import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { BaseUndoAction } from '../entities-ui/undo/base-undo-action';
import { UndoActionTypeEnum } from '../entities-ui/undo/undo-action-type.enum';
import {
  ComponentType,
  ParentInteraction,
  ParentInteractionCollection,
  ParentInteractionHTML,
} from '../components/parent-interaction.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { ContentModelBase } from '../entities/contents/content-model-base';
import { NoteUserCursorWS } from '../entities/ws/note-user-cursor';
import { EditorFacadeService } from '../services/editor-facade.service';
import { EditorOptions } from '../entities-ui/editor-options';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
export class EditorBaseComponent {

  @Input() set noteId(noteId: string) {
    const value = this.options$.getValue();
    this.options$.next({ ...value, noteId });
  }

  @Input() set userId(userId: string) {
    const value = this.options$.getValue();
    this.options$.next({ ...value, userId });
  }

  @Input() set folderId(folderId: string) {
    const value = this.options$.getValue();
    this.options$.next({ ...value, folderId });
  }

  @Input() set isReadOnlyMode(isReadOnlyMode: boolean) {
    const value = this.options$.getValue();
    this.options$.next({ ...value, isReadOnlyMode });
  }

  @Input() set connectToNote(connectToNote: boolean) {
    const value = this.options$.getValue();
    this.options$.next({ ...value, connectToNote });
  }

  @Input()
  cursorActive = true;

  @Select(NoteStore.cursors)
  cursors$?: Observable<NoteUserCursorWS[]>;

  titleInited = false;

  isOverEmpty = false;

  isDragging = false;

  readonly options$ = new BehaviorSubject<EditorOptions>({ noteId: null, isReadOnlyMode: true, connectToNote: true });

  protected elementsQuery?: QueryList<ParentInteraction<ContentModelBase>>;

  constructor(public facade: EditorFacadeService) { }

  @ViewChildren('htmlComp') set elementsSet(elms: QueryList<ParentInteraction<ContentModelBase>>) {
    this.elementsQuery = elms;
    this.facade.contentUpdateWsService.elements = elms;
    this.facade.contentEditorSyncService.elements = elms;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get elements(): ParentInteraction<ContentModelBase>[] | undefined {
    return this.elementsQuery?.toArray();
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get htmlElements(): ParentInteractionHTML[] | undefined {
    return this.elements
      ?.filter((x) => x.type === ComponentType.HTML)
      .map((x) => x as ParentInteractionHTML);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get collectionElements(): ParentInteractionCollection[] | undefined {
    return this.elements
      ?.filter((x) => x.type === ComponentType.Collection)
      .map((x) => x as ParentInteractionCollection);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get first(): ParentInteraction<ContentModelBase> | undefined {
    return this.elementsQuery?.first;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get preLast(): ParentInteraction<ContentModelBase> | undefined | null {
    if (!this.elements) return;
    if (this.elements.length >= 2) {
      return this.elements[this.elements.length - 2];
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get last(): ParentInteraction<ContentModelBase> | undefined {
    return this.elementsQuery?.last;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get lastText(): boolean {
    const el = this.elementsQuery?.last;
    return el?.type === ComponentType.HTML;
  }

  getSelectedElements(): ParentInteraction<ContentModelBase>[] {
    return this.getElements((x) => this.facade.selectionService.isSelectedAll(x.getContentId()));
  }

  getSelectedHTMLElements(): ParentInteractionHTML[] {
    return this.getElements(
      (x) =>
        x.type === ComponentType.HTML &&
        this.facade.selectionService.isSelectedAll(x.getContentId()),
    );
  }

  getSelectedCollectionElements(): ParentInteractionCollection[] {
    return this.getElements(
      (x) =>
        x.type === ComponentType.Collection &&
        this.facade.selectionService.isSelectedAll(x.getContentId()),
    );
  }

  getElementById(contentId: string): ParentInteraction<ContentModelBase> | undefined {
    return this.elements?.find((x) => x.getContentId() === contentId);
  }

  getElements<T extends ParentInteraction<ContentModelBase>>(
    predicate: (x: ParentInteraction<ContentModelBase>) => boolean,
  ): T[] {
    return this.elements?.filter((x) => predicate(x)) as T[];
  }

  getElementByIndex<T extends ParentInteraction<ContentModelBase>>(index: number): T | null {
    if (!this.elements) return null;
    return this.elements[index] as T;
  }

  getHTMLElementById(contentId: string): ParentInteractionHTML | null | undefined {
    if (!this.htmlElements) return null;
    return this.htmlElements.find((x) => x.getContentId() === contentId);
  }

  getHTMLElementsById(contentIds: string[]): ParentInteractionHTML[] | null {
    if (!this.htmlElements) return null;
    return this.htmlElements.filter((x) => contentIds.some((id) => id === x.getContentId()));
  }

  getCollectionElementById(contentId: string): ParentInteractionCollection | undefined | null {
    if (!this.collectionElements) return null;
    return this.collectionElements.find((x) => x.getContentId() === contentId);
  }

  postAction(): void {
    if (this.options$.getValue().isReadOnlyMode || !this.elementsQuery) {
      return;
    }
    const empty = this.elements?.length === 0;
    const isCanAppend = empty || this.isCanAddNewItem(this.last);
    if (isCanAppend) {
      const content = this.facade.contentEditorTextService.appendNewEmptyContentToEnd();
      const action = new BaseUndoAction(UndoActionTypeEnum.deleteContent, content.id);
      this.facade.momentoStateService.saveToStack(action);
    }
    this.facade.contentEditorSyncService.change();
  }

  isCanAddNewItem(el?: ParentInteraction<ContentModelBase>) {
    if (!el || el.type === ComponentType.Collection) return true;
    const htmlComponent = el as ParentInteractionHTML;
    const content = htmlComponent.getContent();
    if (!content) return true;
    const uiText = htmlComponent.getText();
    if (uiText?.length !== 0) {
      return true;
    }
    return false;
  }
}
