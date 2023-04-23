import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { TransformToFileContent } from '../../../models/transform-file-content.model';
import { TypeUploadFile } from '../../../models/enums/type-upload-file.enum';
import { TypeUploadFormats } from '../../../models/enums/type-upload-formats.enum';
import { BaseTextElementComponent } from '../html-base.component';
import { NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/note-text-type.enum';
import { HeadingTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/heading-type.enum';
import { isValidURL } from '../../../../../../shared/utils/is-valid-url.util';
import { ClickableSelectableEntities } from '../../../content-editor-services/models/clickable-selectable-entities.enum';
import { HtmlComponentsFacadeService } from '../../html-components-services/html-components.facade.service';

@Component({
  selector: 'app-html-text-part',
  templateUrl: './html-text-part.component.html',
  styleUrls: ['./html-text-part.component.scss', '../../../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlTextPartComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Output()
  transformToFile = new EventEmitter<TransformToFileContent>();

  @ViewChild('uploadFile') uploadFile: ElementRef;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  textType = NoteTextTypeENUM;

  headingType = HeadingTypeENUM;

  typeUpload = TypeUploadFile;

  formats: string;

  isMultiply = false;

  constructor(
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    facade: HtmlComponentsFacadeService,
  ) {
    super(cdr, facade);
  }

  get isLink() {
    return isValidURL(this.contentHtml?.nativeElement?.textContent);
  }

  get currentTextContent() {
    return this.contentHtml?.nativeElement?.textContent;
  }

  get cursorShift() {
    return { top: 5, left: 5 };
  }

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}

  ngAfterViewInit(): void {
    this.setHandlers();
  }

  getHost() {
    return this.host;
  }

  ngOnDestroy(): void {
    this.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.initBaseHTML();
  }

  transformToFileHandler($event, type: TypeUploadFile, isMultiply: boolean) {
    $event.preventDefault();
    this.isMultiply = isMultiply;
    this.uploadFile.nativeElement.uploadType = type;
    this.formats = TypeUploadFormats[TypeUploadFile[type]];
    setTimeout(() => this.uploadFile.nativeElement.click());
  }

  preventClick = ($event) => {
    $event.preventDefault();
  };

  isFocusToNext = () => true;

  changeDetectionChecker = () => {
    // console.log('Text html changeDetectionChecker: ');
  };

  uploadFiles(event): void {
    const type = this.uploadFile.nativeElement.uploadType as TypeUploadFile;
    const files = event.target.files as File[];
    this.transformToFile.emit({ contentId: this.content.id, typeFile: type, files: [...files] });
  }

  enter($event: any): void {
    $event.preventDefault();
    const breakModel = this.facade.apiBrowser.pressEnterHandler(this.getEditableNative());
    const event = super.eventEventFactory(breakModel, NoteTextTypeENUM.default, this.content.id);
    this.enterEvent.emit(event);
  }

  setFocusedElement(): void {
    this.facade.clickableService.setContent(
      this.content,
      null,
      ClickableSelectableEntities.Text,
      this,
    );
  }
}
