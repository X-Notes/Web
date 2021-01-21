import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentModel, HtmlText, NumberList } from '../../../models/ContentMode';
import { NumberListService } from '../../html-business-logic/numberList.service';

@Component({
  selector: 'app-html-number-list',
  templateUrl: './html-number-list.component.html',
  styleUrls: ['./html-number-list.component.scss'],
  providers: [NumberListService]
})
export class HtmlNumberListComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  content: ContentModel<NumberList>;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public numberService: NumberListService) { }

  ngAfterViewInit(): void {
    this.numberService.setHandlers(this.content, this.contentHtml);
  }

  ngOnDestroy(): void {
    this.numberService.destroysListeners();
  }

  ngOnInit(): void {
    this.numberService.contentStr = this.content.data.content;
  }

}
