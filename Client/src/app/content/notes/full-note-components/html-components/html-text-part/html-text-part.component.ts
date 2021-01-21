import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ContentModel, Html } from '../../../models/ContentMode';
import { TextService } from '../../html-business-logic/text.service';

@Component({
  selector: 'app-html-text-part',
  templateUrl: './html-text-part.component.html',
  styleUrls: ['./html-text-part.component.scss'],
  providers: [TextService]
})
export class HtmlTextPartComponent implements OnInit, OnDestroy, AfterViewInit {

  listeners = [];

  @Input()
  content: ContentModel<Html>;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  constructor(public textService: TextService) { }


  ngAfterViewInit(): void {
    this.textService.setHandlers(this.content, this.contentHtml);
  }


  ngOnDestroy(): void {
    this.textService.destroysListeners();
  }

  ngOnInit(): void {
    this.textService.contentStr = this.content.data.html;
  }

}
