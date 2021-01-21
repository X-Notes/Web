import { Component, Input, OnInit } from '@angular/core';
import { ContentModel, HtmlText } from '../../../models/ContentMode';

@Component({
  selector: 'app-html-number-list',
  templateUrl: './html-number-list.component.html',
  styleUrls: ['./html-number-list.component.scss']
})
export class HtmlNumberListComponent implements OnInit {

  @Input()
  content: ContentModel<HtmlText>;


  constructor() { }

  ngOnInit(): void {
  }

}
