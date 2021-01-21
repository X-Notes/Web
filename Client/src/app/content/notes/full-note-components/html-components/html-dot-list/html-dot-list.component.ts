import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentModel, DotList, HtmlText } from '../../../models/ContentMode';
import { DotListService } from '../../html-business-logic/dotList.service';

@Component({
  selector: 'app-html-dot-list',
  templateUrl: './html-dot-list.component.html',
  styleUrls: ['./html-dot-list.component.scss'],
  providers: [DotListService]
})
export class HtmlDotListComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  content: ContentModel<DotList>;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public dotListService: DotListService) { }

  ngAfterViewInit(): void {
    this.dotListService.setHandlers(this.content, this.contentHtml);
  }


  ngOnDestroy(): void {
    this.dotListService.destroysListeners();
  }

  ngOnInit(): void {
    this.dotListService.contentStr = this.content.data.content;
  }
}
