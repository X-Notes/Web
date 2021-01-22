import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CheckedList, ContentModel, HtmlText } from '../../../models/ContentMode';
import { EnterEvent } from '../../../models/enterEvent';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { CheckListService } from '../../html-business-logic/checkList.service';

@Component({
  selector: 'app-html-check-list',
  templateUrl: './html-check-list.component.html',
  styleUrls: ['./html-check-list.component.scss'],
  providers: [CheckListService]
})
export class HtmlCheckListComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Input()
  content: ContentModel<CheckedList>;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public checkListService: CheckListService) { }


  ngAfterViewInit(): void {
    this.checkListService.setHandlers(this.content, this.contentHtml, this.enterEvent);
  }

  ngOnDestroy(): void {
    this.checkListService.destroysListeners();
  }

  ngOnInit(): void {
    this.checkListService.contentStr = this.content.data.content;
  }

  setFocus($event?) {
    this.checkListService.setFocus($event, this.contentHtml);
  }

  setFocusToEnd() {
    this.checkListService.setFocusToEnd(this.contentHtml);
  }

}
