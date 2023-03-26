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
import { ComponentType, ParentInteraction } from '../../models/parent-interaction.interface';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { BaseEditorElementComponent } from '../base-html-components';
import { HtmlComponentsFacadeService } from '../html-components-services/html-components.facade.service';
import { TitleCollectionComponent } from './title-collection/title-collection.component';

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

  uploadHandler = () => {
    this.uploadRef.nativeElement.value = null;
    this.uploadRef.nativeElement.click();
  };

  syncContentWithLayout() {
    const el = this.titleComponent.titleHtml.nativeElement;
    const data = this.facade.apiBrowserTextService.saveRangePositionTextOnly(el);
    this.updateInternal();
    this.detectChanges();
    this.facade.apiBrowserTextService.setCaretFirstChild(el, data);
  }

  checkForDelete() {
    const item = this.content.items.find((x) => this.facade.clickableService.isClicked(x.fileId));
    if (item) {
      this.deleteContentItemEvent.emit(item.fileId);
    }
  }

  uploadFiles(files: File[]) {
    if (files?.length > 0) {
      this.uploadEvent.emit({ contentId: this.content.id, files: [...files] });
    }
  }

  onTitleChangeInput(name: string) {
    console.log('name: ', name);
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
    this.clickItemHandler(null);
  }

  clickItemHandler(itemId: string) {
    this.facade.clickableService.setContent(
      this.content,
      itemId,
      this.selectType,
      this as any as ParentInteraction,
    );
    if (itemId) {
      const item = document.getElementById(itemId);
      item?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    this.facade.clickableService.prevItem?.detectChanges();
  }
}
