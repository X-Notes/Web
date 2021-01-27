import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ContentModel, Heading, HeadingType } from '../../../models/ContentMode';
import { EnterEvent } from '../../../models/enterEvent';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { HeadingService } from '../../html-business-logic/heading.service';

@Component({
  selector: 'app-html-headings',
  templateUrl: './html-headings.component.html',
  styleUrls: ['./html-headings.component.scss'],
  providers: [HeadingService]
})
export class HtmlHeadingsComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @Input()
  content: ContentModel<Heading>;

  hType = HeadingType;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public headingService: HeadingService) { }

  getContent() {
    return this.content;
  }

  ngAfterViewInit(): void {
    this.headingService.setHandlers(this.content, this.contentHtml, this.enterEvent, this.concatThisWithPrev, this.deleteThis);
  }


  ngOnDestroy(): void {
    this.headingService.destroysListeners();
  }

  ngOnInit(): void {
    this.headingService.contentStr = this.content.data.content;
  }

  setFocus($event?) {
    this.headingService.setFocus($event, this.contentHtml);
  }

  setFocusToEnd() {
    this.headingService.setFocusToEnd(this.contentHtml);
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
  }

  mouseOut($event) {
  }

  get isActive()
  {
    return this.content.data.content.length === 0 && document.activeElement === this.getNative();
  }

}
