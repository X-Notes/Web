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
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { ApiServiceNotes } from '../../../api-notes.service';
import { BaseText, ContentType, HeadingType } from '../../../models/ContentMode';
import { EditTextEventModel } from '../../../models/EditTextEventModel';
import { EnterEvent } from '../../../models/enterEvent';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content';
import { TransformContentPhoto } from '../../../models/transform-content-photo';
import { TextService } from '../../html-business-logic/text.service';

@Component({
  selector: 'app-html-text-part',
  templateUrl: './html-text-part.component.html',
  styleUrls: ['./html-text-part.component.scss'],
  providers: [TextService],
})
export class HtmlTextPartComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {
  @Output()
  transformToPhoto = new EventEmitter<TransformContentPhoto>();

  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  updateText = new EventEmitter<EditTextEventModel>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @ViewChild('contentHtml') contentHtml: ElementRef;

  @ViewChild('uploadPhotos') uploadPhoto: ElementRef;

  @Input()
  content: BaseText;

  contentType = ContentType;

  headingType = HeadingType;

  textChanged: Subject<string> = new Subject<string>();

  destroy = new Subject<void>();

  constructor(
    public textService: TextService,
    private store: Store,
    private api: ApiServiceNotes,
  ) {}

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
    this.textService.contentStr = this.content?.content;
    this.textChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((str) => this.updateText.emit({ content: str, contentId: this.content.id }));
  }

  transformContent($event, contentType: ContentType, heading?: HeadingType) {
    $event.preventDefault();
    this.transformTo.emit({ contentType, headingType: heading, id: this.content.id });
  }

  transformToPhotoHandler($event) {
    $event.preventDefault();
    this.uploadPhoto.nativeElement.click();
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
    this.textService.setFocus($event, this.contentHtml);
  }

  setFocusToEnd() {
    this.textService.setFocusToEnd(this.contentHtml);
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

  onInput($event) {
    this.textChanged.next($event.target.innerText);
  }

  async uploadImages(event) {
    const data = new FormData();
    const { files } = event.target;
    for (const file of files) {
      data.append('photos', file);
    }
    this.transformToPhoto.emit({ id: this.content.id, formData: data });
  }
}
