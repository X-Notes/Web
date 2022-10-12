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
import { ApiBrowserTextService } from '../../../api-browser-text.service';
import { BaseCollection } from '../../../models/editor-models/base-collection';
import { BaseFile } from '../../../models/editor-models/base-file';
import { TextBlock } from '../../../models/editor-models/text-models/text-block';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { ClickableSelectableEntities } from '../../content-editor-services/models/clickable-selectable-entities.enum';
import { UploadFileToEntity } from '../../models/upload-files-to-entity';
import { BaseEditorElementComponent } from '../base-html-components';
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

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    cdr: ChangeDetectorRef,
    protected clickableContentService: ClickableContentService,
    protected apiBrowserTextService: ApiBrowserTextService,
    public selectType: ClickableSelectableEntities,
  ) {
    super(cdr);
  }

  get isDragActive(): boolean {
    return !this.isReadOnlyMode && !this.isSelectModeActive && !this.content.isLoading;
  }

  get isEmpty(): boolean {
    if (!this.content.items || this.content.items.length === 0) {
      return true;
    }
    return false;
  }

  uploadHandler = () => {
    this.uploadRef.nativeElement.value = null;
    this.uploadRef.nativeElement.click();
  };

  syncHtmlWithLayout = () => {
    // TODO
  };

  updateHTML = () => {
    return null;
  };

  syncContentWithLayout() {
    const el = this.titleComponent.titleHtml.nativeElement;
    const data = this.apiBrowserTextService.saveRangePositionTextOnly(el);
    this.updateIternal();
    this.detectChanges();
    this.apiBrowserTextService.setCaretFirstChild(el, data);
  }

  getTextBlocks = (): TextBlock[] => {
    return null;
  };

  checkForDelete() {
    const item = this.content.items.find((x) => this.clickableContentService.isClicked(x.fileId));
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
    this.content.name = name;
    this.someChangesEvent.emit();
  }

  getContentId(): string {
    return this.content.id;
  }

  getContent(): T {
    return this.content;
  }

  updateIternal() {}

  syncContentItems() {
    this.detectChanges();
  }

  scrollAndFocusToTitle(): void {
    this.titleComponent.focusOnTitle();
    this.titleComponent.scrollToTitle();
    this.clickItemHandler(null);
    this.runDetectChangesChildren.emit();
  }

  clickItemHandler(itemId: string) {
    this.clickableContentService.setContent(this.content, itemId, this.selectType, null);
    const item = document.getElementById(itemId);
    item?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.runDetectChangesChildren.emit();
  }
}
