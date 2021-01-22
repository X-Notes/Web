import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ContentModel, ContentType, HtmlText, NumberList } from '../../../models/ContentMode';
import { EnterEvent } from '../../../models/enterEvent';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { NumberListService } from '../../html-business-logic/numberList.service';

@Component({
  selector: 'app-html-number-list',
  templateUrl: './html-number-list.component.html',
  styleUrls: ['./html-number-list.component.scss'],
  providers: [NumberListService]
})
export class HtmlNumberListComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction, OnChanges {

  @Output()
  transformToTextEvent = new EventEmitter<string>();

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Input()
  prevContent: ContentModel;

  @Input()
  prevType: ContentType;

  @Input()
  content: ContentModel<NumberList>;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public numberService: NumberListService) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.setNumber();
  }

  ngAfterViewInit(): void {
    this.numberService.setHandlers(this.content, this.contentHtml, this.enterEvent);
  }

  ngOnDestroy(): void {
    this.numberService.destroysListeners();
  }

  ngOnInit(): void {
    this.numberService.contentStr = this.content.data.content;
    this.numberService.transformToTextEvent = this.transformToTextEvent;
  }

  setNumber() {
    if (this.prevContent.type === ContentType.NUMBERLIST) {
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

}
