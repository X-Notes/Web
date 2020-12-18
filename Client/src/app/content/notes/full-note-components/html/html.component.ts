import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ContentModel, Html } from '../../models/ContentMode';
import {QuillEditor} from 'quill';
import { QuillModules } from 'ngx-quill';

@Component({
  selector: 'app-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss']
})
export class HtmlComponent implements OnInit {

  @ViewChild('editor', {static: false}) editor: QuillEditor;

  @Input()
  content: ContentModel<Html>;

  editorStyle: object = {
    border: 'none'
  };
  editorModules: any;

  constructor() { }

  ngOnInit(): void {
    this.editorModules = this.getModules();
  }


  getModules(): QuillModules {
    const modules: QuillModules = {
      toolbar: {
        container: [
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ script: 'sub'}, { script: 'super' }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link', 'image']
        ],
        handlers: {
        }
      },
    };
    return modules;
  }

}
