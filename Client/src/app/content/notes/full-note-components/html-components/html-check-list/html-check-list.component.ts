import { Component, Input, OnInit } from '@angular/core';
import { ContentModel, HtmlText } from '../../../models/ContentMode';

@Component({
  selector: 'app-html-check-list',
  templateUrl: './html-check-list.component.html',
  styleUrls: ['./html-check-list.component.scss']
})
export class HtmlCheckListComponent implements OnInit {

  @Input()
  content: ContentModel<HtmlText>;

  constructor() { }

  ngOnInit(): void {
  }

}
