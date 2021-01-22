import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ContentModel, HtmlText } from '../../../models/ContentMode';
import { EnterEvent } from '../../../models/enterEvent';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TextService } from '../../html-business-logic/text.service';

@Component({
  selector: 'app-html-text-part',
  templateUrl: './html-text-part.component.html',
  styleUrls: ['./html-text-part.component.scss'],
  providers: [TextService]
})
export class HtmlTextPartComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Input()
  content: ContentModel<HtmlText>;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public textService: TextService) { }


  ngAfterViewInit(): void {
    this.textService.setHandlers(this.content, this.contentHtml, this.enterEvent);
  }


  ngOnDestroy(): void {
    this.textService.destroysListeners();
  }

  ngOnInit(): void {
    this.textService.contentStr = this.content.data.content;
  }

  buttonHandler($event) {
    $event.preventDefault();
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

}
