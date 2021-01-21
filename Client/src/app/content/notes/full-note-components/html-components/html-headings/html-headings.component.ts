import { Component, Input, OnInit } from '@angular/core';
import { ContentModel, Heading } from '../../../models/ContentMode';

@Component({
  selector: 'app-html-headings',
  templateUrl: './html-headings.component.html',
  styleUrls: ['./html-headings.component.scss']
})
export class HtmlHeadingsComponent implements OnInit {

  @Input()
  content: ContentModel<Heading>;

  constructor() { }

  ngOnInit(): void {
  }

}
