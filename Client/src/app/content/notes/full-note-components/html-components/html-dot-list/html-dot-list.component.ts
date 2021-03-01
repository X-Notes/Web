import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BaseText, ContentModel, } from '../../../models/ContentMode';
import { EnterEvent } from '../../../models/enterEvent';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content';
import { DotListService } from '../../html-business-logic/dotList.service';

@Component({
  selector: 'app-html-dot-list',
  templateUrl: './html-dot-list.component.html',
  styleUrls: ['./html-dot-list.component.scss'],
  providers: [DotListService]
})
export class HtmlDotListComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {

  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @Input()
  content: BaseText;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public dotListService: DotListService) { }

  getContent() {
    return this.content;
  }

  ngAfterViewInit(): void {
    this.dotListService.setHandlers(this.content, this.contentHtml, this.enterEvent, this.concatThisWithPrev, this.deleteThis);
  }


  ngOnDestroy(): void {
    this.dotListService.destroysListeners();
  }

  ngOnInit(): void {
    this.dotListService.contentStr = this.content.content;
    this.dotListService.transformTo = this.transformTo;
  }

  setFocus($event?) {
    this.dotListService.setFocus($event, this.contentHtml);
  }

  setFocusToEnd() {
    this.dotListService.setFocusToEnd(this.contentHtml);
  }

  updateHTML(content: string) {
    this.content.content = content;
    this.contentHtml.nativeElement.innerHTML = content;
  }

  getNative()
  {
    return this.contentHtml?.nativeElement;
  }

  mouseEnter($event) {
    this.dotListService.mouseEnter($event, this.contentHtml);
  }

  mouseOut($event) {
    this.dotListService.mouseOut($event, this.contentHtml);
  }

  get isActive()
  {
    return this.dotListService.isActive(this.contentHtml);
  }
}
