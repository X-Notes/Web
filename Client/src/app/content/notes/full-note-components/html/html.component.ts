import { Component, Input, OnInit } from '@angular/core';
import { ContentModel, Html } from '../../models/ContentMode';

@Component({
  selector: 'app-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss']
})
export class HtmlComponent implements OnInit {

  @Input()
  content: ContentModel<Html>;

  constructor() { }

  ngOnInit(): void {

  }


}
