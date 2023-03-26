/* eslint-disable no-underscore-dangle */
import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { EditorFacadeService } from '../content-editor-services/editor-facade.service';
import {
  ComponentType,
  ParentInteraction,
  ParentInteractionCollection,
  ParentInteractionHTML,
} from '../models/parent-interaction.interface';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
export class EditorBaseComponent {
  @Input() noteId?: string;

  @Input()
  isReadOnlyMode = true;

  protected elementsQuery: QueryList<ParentInteraction>;

  constructor(public facade: EditorFacadeService) {}

  @ViewChildren('htmlComp') set elementsSet(elms: QueryList<ParentInteraction>) {
    this.elementsQuery = elms;
    this.facade.contentUpdateWsService.elements = elms;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get elements(): ParentInteraction[] {
    return this.elementsQuery?.toArray();
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get htmlElements(): ParentInteractionHTML[] {
    return this.elements
      ?.filter((x) => x.type === ComponentType.HTML)
      .map((x) => x as ParentInteractionHTML);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get collectionElements(): ParentInteractionCollection[] {
    return this.elements
      ?.filter((x) => x.type === ComponentType.Collection)
      .map((x) => x as ParentInteractionCollection);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get first(): ParentInteraction {
    return this.elementsQuery?.first;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get preLast(): ParentInteraction {
    if (this.elements.length >= 2) {
      return this.elements[this.elements.length - 2];
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get last(): ParentInteraction {
    return this.elementsQuery?.last;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get lastText(): boolean {
    const el = this.elementsQuery?.last;
    return el.type === ComponentType.HTML;
  }

  getSelectedElements(): ParentInteraction[] {
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

  getElementById(contentId: string): ParentInteraction {
    return this.elements?.find((x) => x.getContentId() === contentId);
  }

  getElements<T extends ParentInteraction>(predicate: (x: ParentInteraction) => boolean): T[] {
    return this.elements?.filter((x) => predicate(x)) as T[];
  }

  getElementByIndex<T extends ParentInteraction>(index: number): T {
    return this.elements[index] as T;
  }

  getHTMLElementById(contentId: string): ParentInteractionHTML {
    return this.htmlElements.find((x) => x.getContentId() === contentId);
  }

  getHTMLElementsById(contentIds: string[]): ParentInteractionHTML[] {
    return this.htmlElements.filter((x) => contentIds.some((id) => id === x.getContentId()));
  }

  getCollectionElementById(contentId: string): ParentInteractionCollection {
    return this.collectionElements.find((x) => x.getContentId() === contentId);
  }

  postAction(): void {
    if (this.isReadOnlyMode || !this.elementsQuery) {
      return;
    }
    const empty = this.elements?.length === 0;
    const isCanAppend = empty || this.isCanAddNewItem(this.last);
    if (isCanAppend) {
      this.facade.contentEditorTextService.appendNewEmptyContentToEnd();
    }
    this.facade.contentEditorSyncService.change();
    this.facade.contentEditorRestoreService.save();
  }

  isCanAddNewItem(el: ParentInteraction) {
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
