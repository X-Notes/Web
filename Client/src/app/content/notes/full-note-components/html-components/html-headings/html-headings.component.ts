import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentModel, Heading, HeadingType } from '../../../models/ContentMode';
import { HeadingService } from '../../html-business-logic/heading.service';

@Component({
  selector: 'app-html-headings',
  templateUrl: './html-headings.component.html',
  styleUrls: ['./html-headings.component.scss'],
  providers: [HeadingService]
})
export class HtmlHeadingsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  content: ContentModel<Heading>;
  hType = HeadingType;
  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public headingService: HeadingService) { }

  ngAfterViewInit(): void {
    this.headingService.setHandlers(this.content, this.contentHtml);
  }


  ngOnDestroy(): void {
    this.headingService.destroysListeners();
  }

  ngOnInit(): void {
    this.headingService.contentStr = this.content.data.content;
  }

}
