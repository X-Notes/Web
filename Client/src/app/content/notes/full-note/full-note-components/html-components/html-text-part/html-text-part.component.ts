import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
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
import { TextService } from '../../html-business-logic/text.service';

@Component({
  selector: 'app-html-text-part',
  templateUrl: './html-text-part.component.html',
  styleUrls: ['./html-text-part.component.scss'],
  providers: [TextService],
})
export class HtmlTextPartComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {
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

  @ViewChild('contentHtml') contentHtml: ElementRef;

  @ViewChild('uploadFile') uploadFile: ElementRef;

  @Input()
  content: BaseText;

  @Input()
  isReadOnlyMode = false;

  textType = NoteTextTypeENUM;

  headingType = HeadingTypeENUM;

  textChanged: Subject<string> = new Subject<string>();

  destroy = new Subject<void>();

  typeUpload = TypeUploadFile;

  formats: string;

  isMulptiply = false;

  constructor(public textService: TextService) {}

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

  ngOnDestroy(): void {
    this.textService.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.textChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((str) => {
        this.content.content = str;
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
    this.content.isBold = !this.content.isBold;
    this.updateText.emit(this.content);
  }

  setItalicStyle($event) {
    $event.preventDefault();
    this.content.isItalic = !this.content.isItalic;
    this.updateText.emit(this.content);
  }

  preventClick = ($event) => {
    $event.preventDefault();
  };

  mouseEnter($event) {
    $event.preventDefault();
    this.textService.mouseEnter($event, this.contentHtml);
  }

  mouseOut($event) {
    this.textService.mouseOut($event, this.contentHtml);
  }

  setFocus($event?) {
    this.textService.setFocus($event, this.contentHtml, this.content);
  }

  setFocusToEnd() {
    this.textService.setFocusToEnd(this.contentHtml, this.content);
  }

  updateHTML(content: string) {
    this.content.content = content;
    this.contentHtml.nativeElement.innerHTML = content;
  }

  getNative() {
    return this.contentHtml?.nativeElement;
  }

  get isActive() {
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
