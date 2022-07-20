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
import {
  HeadingTypeENUM,
  NoteTextTypeENUM,
} from 'src/app/content/notes/models/editor-models/base-text';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content.model';
import { TransformToFileContent } from '../../../models/transform-file-content.model';
import { TypeUploadFile } from '../../../models/enums/type-upload-file.enum';
import { TypeUploadFormats } from '../../../models/enums/type-upload-formats.enum';
import { BaseTextElementComponent } from '../html-base.component';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SelectionService } from '../../../content-editor-services/selection.service';
import { ClickableContentService } from '../../../content-editor-services/clickable-content.service';

@Component({
  selector: 'app-html-text-part',
  templateUrl: './html-text-part.component.html',
  styleUrls: ['./html-text-part.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlTextPartComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction
{
  @Output()
  transformToFile = new EventEmitter<TransformToFileContent>();

  @Output()
  transformTo = new EventEmitter<TransformContent>();

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

  isMulptiply = false;

  constructor(
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    apiBrowserTextService: ApiBrowserTextService,
    public pS: PersonalizationService,
    selectionService: SelectionService,
    clickableService: ClickableContentService,
    renderer: Renderer2,
  ) {
    super(cdr, apiBrowserTextService, selectionService, clickableService, renderer);
  }

  get isLink() {
    return this.validURL(this.contentHtml?.nativeElement?.textContent);
  }

  get currentTextCotent() {
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

  transformContent($event, contentType: NoteTextTypeENUM, heading?: HeadingTypeENUM) {
    $event.preventDefault();
    this.transformTo.emit({
      textType: contentType,
      headingType: heading,
      id: this.content.id,
      setFocusToEnd: true,
    });
  }

  transformToFileHandler($event, type: TypeUploadFile, isMulptiply: boolean) {
    $event.preventDefault();
    this.isMulptiply = isMulptiply;
    this.uploadFile.nativeElement.uploadType = type;
    this.formats = TypeUploadFormats[TypeUploadFile[type]];
    setTimeout(() => this.uploadFile.nativeElement.click());
  }

  preventClick = ($event) => {
    $event.preventDefault();
  };

  isFocusToNext = () => true;

  changeDetectionChecker = (): void => {};

  validURL = (str) => {
    let url;
    try {
      url = new URL(str);
    } catch (_) {
      return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
  };

  uploadFiles(event) {
    const type = this.uploadFile.nativeElement.uploadType as TypeUploadFile;
    const files = event.target.files as File[];
    this.transformToFile.emit({ contentId: this.content.id, typeFile: type, files: [...files] });
  }

  enter($event: any) {
    $event.preventDefault();
    const breakModel = this.apiBrowserTextService.pressEnterHandler(this.getEditableNative());
    const event = super.eventEventFactory(breakModel, NoteTextTypeENUM.Default, this.content.id);
    this.enterEvent.emit(event);
  }
}
