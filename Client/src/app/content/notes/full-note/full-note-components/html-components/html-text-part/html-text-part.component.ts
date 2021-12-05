import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import {
  BaseText,
  HeadingTypeENUM,
  NoteTextTypeENUM,
} from '../../../../models/content-model.model';
import { EnterEvent } from '../../../models/enter-event.model';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content.model';
import { TransformToFileContent } from '../../../models/transform-file-content.model';
import { TypeUploadFile } from '../../../models/enums/type-upload-file.enum';
import { TypeUploadFormats } from '../../../models/enums/type-upload-formats.enum';
import { TextService } from '../html-business-logic/text.service';
import { SetFocus } from '../../../models/set-focus';
import { BaseHtmlComponent } from '../../base-html-components';

@Component({
  selector: 'app-html-text-part',
  templateUrl: './html-text-part.component.html',
  styleUrls: ['./html-text-part.component.scss'],
  providers: [TextService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlTextPartComponent
  extends BaseHtmlComponent
  implements OnInit, OnDestroy, AfterViewInit, DoCheck, ParentInteraction {
  @Output()
  transformToFile = new EventEmitter<TransformToFileContent>();

  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  updateText = new EventEmitter<BaseText>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output()
  onFocus = new EventEmitter<HtmlTextPartComponent>();

  @ViewChild('contentHtml') contentHtml: ElementRef;

  @ViewChild('uploadFile') uploadFile: ElementRef;

  @Input()
  content: BaseText;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  textType = NoteTextTypeENUM;

  headingType = HeadingTypeENUM;

  textChanged: Subject<string> = new Subject<string>();

  destroy = new Subject<void>();

  typeUpload = TypeUploadFile;

  formats: string;

  isMulptiply = false;

  constructor(public textService: TextService, private host: ElementRef, cdr: ChangeDetectorRef) {
    super(cdr);
  }
  ngDoCheck(): void {
    // console.log('do check text');
  }

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}

  getContent() {
    return this.content;
  }

  ngAfterViewInit(): void {
    this.textService.setHandlers(
      this.content,
      this.contentHtml,
      this.enterEvent,
      this.concatThisWithPrev,
      this.deleteThis,
    );
  }

  getHost() {
    return this.host;
  }

  ngOnDestroy(): void {
    this.textService.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.textChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((str) => {
        this.content.contentSG = str;
        this.updateText.emit(this.content);
      });
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

  setBoldStyle($event) {
    $event.preventDefault();
    this.content.isBoldSG = !this.content.isBoldSG;
    this.updateText.emit(this.content);
  }

  setItalicStyle($event) {
    $event.preventDefault();
    this.content.isItalicSG = !this.content.isItalicSG;
    this.updateText.emit(this.content);
  }

  preventClick = ($event) => {
    $event.preventDefault();
  };

  mouseEnter($event) {
    $event.preventDefault();
    this.textService.mouseEnter($event, this.contentHtml);
    this.isMouseOver = true;
  }

  mouseLeave($event) {
    this.textService.mouseLeave($event, this.contentHtml);
    this.isMouseOver = false;
  }

  isFocusToNext = () => true;

  setFocus(entity: SetFocus) {
    this.textService.setFocus(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  changeDetectionChecker() {
    console.log('Check text');
  }

  setFocusToEnd() {
    this.textService.setFocusToEnd(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  updateHTML(content: string) {
    this.content.contentSG = content;
    this.contentHtml.nativeElement.innerHTML = content;
  }

  getEditableNative() {
    return this.contentHtml?.nativeElement;
  }

  get isFocused() {
    return this.textService.isActive(this.contentHtml);
  }

  get isLink() {
    return this.validURL(this.contentHtml?.nativeElement?.textContent);
  }

  get CurrentTextCotent() {
    return this.contentHtml?.nativeElement?.textContent;
  }

  validURL = (str) => {
    let url;
    try {
      url = new URL(str);
    } catch (_) {
      return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
  };

  onInput($event) {
    this.textChanged.next($event.target.innerText);
  }

  async uploadFiles(event) {
    const type = this.uploadFile.nativeElement.uploadType as TypeUploadFile;
    const files = event.target.files as File[];
    this.transformToFile.emit({ contentId: this.content.id, typeFile: type, files: [...files] });
  }
}
