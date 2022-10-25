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
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformToFileContent } from '../../../models/transform-file-content.model';
import { TypeUploadFile } from '../../../models/enums/type-upload-file.enum';
import { TypeUploadFormats } from '../../../models/enums/type-upload-formats.enum';
import { BaseTextElementComponent } from '../html-base.component';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SelectionService } from '../../../content-editor-services/selection.service';
import { ClickableContentService } from '../../../content-editor-services/clickable-content.service';
import { NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/note-text-type.enum';
import { HeadingTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/heading-type.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { isValidURL } from '../../../../../../shared/utils/is-valid-url.util';

@Component({
  selector: 'app-html-text-part',
  templateUrl: './html-text-part.component.html',
  styleUrls: ['./html-text-part.component.scss', '../../../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlTextPartComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction
{
  @Output()
  transformToFile = new EventEmitter<TransformToFileContent>();

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onFocus = new EventEmitter<HtmlTextPartComponent>();

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
    apiBrowserTextService: ApiBrowserTextService,
    public pS: PersonalizationService,
    selectionService: SelectionService,
    clickableService: ClickableContentService,
    renderer: Renderer2,
    sanitizer: DomSanitizer,
  ) {
    super(cdr, apiBrowserTextService, selectionService, clickableService, renderer, sanitizer);
  }

  get isLink() {
    return isValidURL(this.contentHtml?.nativeElement?.textContent);
  }

  get currentTextContent() {
    return this.contentHtml?.nativeElement?.textContent;
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
    console.log('Text html contents: ');
  };

  uploadFiles(event): void {
    const type = this.uploadFile.nativeElement.uploadType as TypeUploadFile;
    const files = event.target.files as File[];
    this.transformToFile.emit({ contentId: this.content.id, typeFile: type, files: [...files] });
  }

  enter($event: any): void {
    $event.preventDefault();
    const breakModel = this.apiBrowser.pressEnterHandler(this.getEditableNative());
    const event = super.eventEventFactory(breakModel, NoteTextTypeENUM.default, this.content.id);
    this.enterEvent.emit(event);
  }
}
