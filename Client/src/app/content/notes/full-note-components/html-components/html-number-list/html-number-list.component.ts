import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ContentModel, ContentType, HtmlText, NumberList } from '../../../models/ContentMode';
import { EnterEvent } from '../../../models/enterEvent';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content';
import { NumberListService } from '../../html-business-logic/numberList.service';

@Component({
  selector: 'app-html-number-list',
  templateUrl: './html-number-list.component.html',
  styleUrls: ['./html-number-list.component.scss'],
  providers: [NumberListService]
})
export class HtmlNumberListComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction, OnChanges {

  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @Input()
  prevContent: ContentModel;

  @Input()
  prevType: ContentType;

  @Input()
  content: ContentModel<NumberList>;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public numberService: NumberListService) { }

  getContent() {
    return this.content;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setNumber();
  }

  ngAfterViewInit(): void {
    this.numberService.setHandlers(this.content, this.contentHtml, this.enterEvent, this.concatThisWithPrev, this.deleteThis);
  }

  ngOnDestroy(): void {
    this.numberService.destroysListeners();
  }

  ngOnInit(): void {
    this.numberService.contentStr = this.content.data.content;
    this.numberService.transformTo = this.transformTo;
  }

  setNumber() {
    if (this.prevContent && this.prevContent.type === ContentType.NUMBERLIST) {
      this.content.data.number = (this.prevContent as ContentModel<NumberList>).data.number + 1;
    } else {
      this.content.data.number = 1;
    }
  }

  setFocus($event?) {
    this.numberService.setFocus($event, this.contentHtml);
  }

  setFocusToEnd() {
    this.numberService.setFocusToEnd(this.contentHtml);
  }

  updateHTML(content: string) {
    this.content.data.content = content;
    this.contentHtml.nativeElement.innerHTML = content;
  }

  getNative()
  {
    return this.contentHtml?.nativeElement;
  }

  mouseEnter($event) {
    this.numberService.mouseEnter($event, this.contentHtml);
  }

  mouseOut($event) {
    this.numberService.mouseOut($event, this.contentHtml);
  }

  get isActive()
  {
    return this.numberService.isActive(this.contentHtml);
  }
}
