import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { BaseCollection } from '../../../models/editor-models/base-collection';
import { BaseFile } from '../../../models/editor-models/base-file';
import { ClickableSelectableEntities } from '../../content-editor-services/models/clickable-selectable-entities.enum';
import { MutateCollectionInfoAction } from '../../content-editor-services/models/undo/mutate-collection-info';
import {
  ComponentType,
  ParentInteractionCollection,
} from '../../models/parent-interaction.interface';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { BaseEditorElementComponent } from '../base-html-components';
import { HtmlComponentsFacadeService } from '../html-components-services/html-components.facade.service';
import { TitleCollectionComponent } from './title-collection/title-collection.component';
import { CollectionCursorUI } from '../cursors/collection-cursor-ui';
import { Observable } from 'rxjs';
import { CursorTypeENUM } from '../../models/cursors/cursor-type.enum';
import { map } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { NoteStore } from '../../../state/notes-state';
import { UpdateCursor } from '../../models/cursors/cursor';
import { UpdateCursorAction } from '../../../state/editor-actions';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class CollectionBaseComponent<
  T extends BaseCollection<BaseFile>,
> extends BaseEditorElementComponent {
  @Output()
  uploadEvent = new EventEmitter<UploadFileToEntity>();

  @Output()
  deleteContentEvent = new EventEmitter<string>();

  @Output()
  deleteContentItemEvent = new EventEmitter<string>();

  @ViewChild(TitleCollectionComponent) titleComponent: TitleCollectionComponent;

  @ViewChild('uploadRef') uploadRef: ElementRef<HTMLInputElement>;

  @Input()
  content: T;

  @Input()
  noteId: string;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  type = ComponentType.Collection;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    cdr: ChangeDetectorRef,
    public selectType: ClickableSelectableEntities,
    facade: HtmlComponentsFacadeService,
  ) {
    super(cdr, facade);
  }

  get isDragActive(): boolean {
    return !this.isReadOnlyMode && !this.content.isLoading;
  }

  get isEmpty(): boolean {
    if (!this.content.items || this.content.items.length === 0) {
      return true;
    }
    return false;
  }

  get isActiveState(): boolean {
    return false;
  }

  get uiCursors$(): Observable<CollectionCursorUI[]> {
    return this.getCollectionItemsCursors();
  }

  getCollectionItemsCursors(): Observable<CollectionCursorUI[]> {
    const userId = this.facade.store.selectSnapshot(UserStore.getUser).id;
    return this.cursors$?.pipe(
      map((x) => {
        return x
          .filter(
            (q) =>
              q.userId !== userId &&
              q.entityId === this.content.id &&
              q.type === CursorTypeENUM.collection,
          )
          .map((t) => new CollectionCursorUI(t.itemId, t.color));
      }),
    );
  }

  uploadHandler = () => {
    this.uploadRef.nativeElement.value = null;
    this.uploadRef.nativeElement.click();
  };

  syncLayoutWithContent(): void {
    const el = this.titleComponent.titleHtml.nativeElement;
    const data = this.facade.apiBrowser.saveRangePositionTextOnly(el);
    this.updateInternal();
    this.detectChanges();
    this.facade.apiBrowser.setCaretFirstChild(el, data);
  }

  checkForDelete() {
    const item = this.content.items.find((x) => this.facade.clickableService.isClicked(x.fileId));
    if (item) {
      this.deleteContentItemEvent.emit(item.fileId);
    }
  }

  uploadFiles($event) {
    const files = $event.target?.files;
    if (files?.length > 0) {
      this.uploadEvent.emit({ contentId: this.content.id, files: [...files] });
    }
  }

  onTitleChangeInput(name: string) {
    const action = new MutateCollectionInfoAction({ ...this.content }, this.content.id);
    this.facade.momentoStateService.saveToStack(action);
    this.content.name = name;
    this.someChangesEvent.emit();
  }

  getContentId(): string {
    return this.content.id;
  }

  getContent(): T {
    return this.content;
  }

  updateInternal() {}

  syncContentItems() {
    this.detectChanges();
  }

  scrollAndFocusToTitle(): void {
    this.titleComponent.focusOnTitle();
    this.titleComponent.scrollToTitle();
    this.clickItemHandler(null, true);
  }

  clickItemHandler(itemId: string, keepRanges: boolean = false): void {
    this.facade.clickableService.setContent(
      this.content,
      itemId,
      this.selectType,
      this as any as ParentInteractionCollection,
      keepRanges
    );
    if (itemId) {
      const item = document.getElementById(itemId);
      item?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.facade.clickableService.cursorChanged$.next(() => this.updateCursor(itemId));
    }
    this.facade.clickableService.prevItem?.detectChanges();
  }

  updateCursor(itemId: string): void {
    const color = this.facade.store.selectSnapshot(NoteStore.cursorColor);
    const noteId = this.facade.store.selectSnapshot(NoteStore.oneFull).id;
    const cursor = new UpdateCursor(color).initCollectionItemCursor(this.content.id, itemId);
    this.facade.store.dispatch(new UpdateCursorAction(noteId, cursor));
  }

  syncCollectionItems(): void {}
}
