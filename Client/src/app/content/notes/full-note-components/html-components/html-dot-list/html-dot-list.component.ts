import { Component, Input, OnInit } from '@angular/core';
import { ContentModel, HtmlText } from '../../../models/ContentMode';

@Component({
  selector: 'app-html-dot-list',
  templateUrl: './html-dot-list.component.html',
  styleUrls: ['./html-dot-list.component.scss']
})
export class HtmlDotListComponent implements OnInit {

  @Input()
  content: ContentModel<HtmlText>;

  constructor() { }

  ngOnInit(): void {
  }

}
