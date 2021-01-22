import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ContentModel, HtmlText, NumberList } from '../../../models/ContentMode';
import { EnterEvent } from '../../../models/enterEvent';
import { NumberListService } from '../../html-business-logic/numberList.service';

@Component({
  selector: 'app-html-number-list',
  templateUrl: './html-number-list.component.html',
  styleUrls: ['./html-number-list.component.scss'],
  providers: [NumberListService]
})
export class HtmlNumberListComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Input()
  content: ContentModel<NumberList>;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public numberService: NumberListService) { }

  ngAfterViewInit(): void {
    this.numberService.setHandlers(this.content, this.contentHtml, this.enterEvent);
  }

  ngOnDestroy(): void {
    this.numberService.destroysListeners();
  }

  ngOnInit(): void {
    this.numberService.contentStr = this.content.data.content;
  }

}
