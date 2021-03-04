import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges,
  OnDestroy, OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ApiServiceNotes } from '../../../api-notes.service';
import { BaseText, ContentType, HeadingType } from '../../../models/ContentMode';
import { EnterEvent } from '../../../models/enterEvent';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content';
import { TextService } from '../../html-business-logic/text.service';

@Component({
  selector: 'app-html-text-part',
  templateUrl: './html-text-part.component.html',
  styleUrls: ['./html-text-part.component.scss'],
  providers: [TextService]
})
export class HtmlTextPartComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction, OnChanges {

  @Output()
  addToEndNewText = new EventEmitter();

  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Input()
  content: BaseText;

  @Input()
  isLast: boolean;

  @Input()
  noteId: string;

  contentType = ContentType;
  headingType = HeadingType;

  textChanged: Subject<string> = new Subject<string>();
  destroy = new Subject<void>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public textService: TextService,
              private store: Store,
              private api: ApiServiceNotes) { }

  getContent() {
    return this.content;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isLast) {
      this.isLast = changes.isLast.currentValue;
    }
  }


  ngAfterViewInit(): void {
    this.textService.setHandlers(this.content, this.contentHtml,
      this.enterEvent, this.concatThisWithPrev, this.deleteThis, this.addToEndNewText);
  }


  ngOnDestroy(): void {
    this.textService.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.textService.contentStr = this.content?.content;

    this.textChanged.pipe(
      takeUntil(this.destroy),
      debounceTime(300))
      .subscribe(str => {
        this.api.updateContentText(this.noteId, this.content.id, str).toPromise();
        if (this.isLast) {
          this.addToEndNewText.emit();
          this.isLast = false;
        }
      }
      );
  }

  transformContent($event, contentType: ContentType, heading?: HeadingType) {
    $event.preventDefault();
    this.transformTo.emit({ contentType, headingType: heading, id: this.content.id });
  }

  preventClick($event) {
    $event.preventDefault();
  }

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

}
