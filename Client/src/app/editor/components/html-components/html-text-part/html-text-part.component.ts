import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ClickableSelectableEntities } from 'src/app/editor/entities-ui/clickable-selectable-entities.enum';
import { TypeUploadFile } from 'src/app/editor/entities-ui/files-enums/type-upload-file.enum';
import { TypeUploadFormats } from 'src/app/editor/entities-ui/files-enums/type-upload-formats.enum';
import { TransformToFileContent } from 'src/app/editor/entities-ui/transform-file-content.model';
import { HeadingTypeENUM } from 'src/app/editor/entities/contents/text-models/heading-type.enum';
import { NoteTextTypeENUM } from 'src/app/editor/entities/contents/text-models/note-text-type.enum';
import { isValidURL } from 'src/app/shared/utils/is-valid-url.util';
import { HtmlComponentsFacadeService } from '../../html-components.facade.service';
import { BaseTextElementComponent } from '../html-base.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-html-text-part',
  templateUrl: './html-text-part.component.html',
  styleUrls: ['./html-text-part.component.scss', '../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlTextPartComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @Output()
  transformToFile = new EventEmitter<TransformToFileContent>();

  @ViewChild('uploadFile') uploadFile: ElementRef;

  @ViewChild(MatMenu) menu: MatMenu;

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

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
  backspaceUp() { }

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() { }

  // eslint-disable-next-line class-methods-use-this
  deleteDown() { }

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

  onFirstSlash($event: KeyboardEvent): void {
    if (!this.facade.pS.isMobile()) {
      $event.preventDefault();
      this.menuTrigger.openMenu();
    }
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
