import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ContentModel, Heading, HeadingType } from '../../../models/ContentMode';
import { EnterEvent } from '../../../models/enterEvent';
import { HeadingService } from '../../html-business-logic/heading.service';

@Component({
  selector: 'app-html-headings',
  templateUrl: './html-headings.component.html',
  styleUrls: ['./html-headings.component.scss'],
  providers: [HeadingService]
})
export class HtmlHeadingsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Input()
  content: ContentModel<Heading>;

  hType = HeadingType;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public headingService: HeadingService) { }

  ngAfterViewInit(): void {
    this.headingService.setHandlers(this.content, this.contentHtml, this.enterEvent);
  }


  ngOnDestroy(): void {
    this.headingService.destroysListeners();
  }

  ngOnInit(): void {
    this.headingService.contentStr = this.content.data.content;
  }

}
