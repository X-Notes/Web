import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges,
  OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ContentModel, ContentType, HeadingType, HtmlText } from '../../../models/ContentMode';
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
  content: ContentModel<HtmlText>;

  @Input()
  isLast: boolean;

  contentType = ContentType;
  headingType = HeadingType;

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public textService: TextService) { }

  getContent() {
    return this.content;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isLast)
    {
      this.isLast = changes.isLast.currentValue;
      this.textService.isLast = this.isLast;
    }
  }


  ngAfterViewInit(): void {
    this.textService.setHandlers(this.content, this.contentHtml,
      this.enterEvent, this.concatThisWithPrev, this.deleteThis, this.addToEndNewText);
  }


  ngOnDestroy(): void {
    this.textService.destroysListeners();
  }

  ngOnInit(): void {
    this.textService.contentStr = this.content.data.content;
    this.textService.isLast = this.isLast;
  }

  transformContent($event, type: ContentType, heading?: HeadingType) {
    $event.preventDefault();
    this.transformTo.emit({type, heading, id: this.content.contentId});
  }

  preventClick($event) {
    $event.preventDefault();
  }

  mouseEnter($event) {
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

  focusOut($event)
  {
    this.textService.focusOut();
  }

  updateHTML(content: string) {
    this.content.data.content = content;
    this.contentHtml.nativeElement.innerHTML = content;
  }

  getNative()
  {
    return this.contentHtml?.nativeElement;
  }

}
