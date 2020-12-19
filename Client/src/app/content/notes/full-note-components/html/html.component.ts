import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ContentModel, Html } from '../../models/ContentMode';

@Component({
  selector: 'app-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss']
})
export class HtmlComponent implements OnInit {

  @ViewChild('contentHtml') contentHtml: ElementRef;

  visible = false;

  @Input()
  content: ContentModel<Html>;

  constructor() { }

  ngOnInit(): void {

  }

  mouseEnter($event)
  {
    this.visible = true;
  }
  mouseOut($event)
  {
    this.visible = document.activeElement === this.contentHtml.nativeElement;
  }

  onBlur($event)
  {
    this.visible = false;
  }

  setFocus($event?)
  {
    this.contentHtml.nativeElement.focus();
    this.visible = true;
  }

}
