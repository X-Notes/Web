import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CheckedList, ContentModel, HtmlText } from '../../../models/ContentMode';
import { CheckListService } from '../../html-business-logic/checkList.service';

@Component({
  selector: 'app-html-check-list',
  templateUrl: './html-check-list.component.html',
  styleUrls: ['./html-check-list.component.scss'],
  providers: [CheckListService]
})
export class HtmlCheckListComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  content: ContentModel<CheckedList>;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public checkListService: CheckListService) { }

  ngAfterViewInit(): void {
    this.checkListService.setHandlers(this.content, this.contentHtml);
  }

  ngOnDestroy(): void {
    this.checkListService.destroysListeners();
  }

  ngOnInit(): void {
    this.checkListService.contentStr = this.content.data.content;
  }

}
