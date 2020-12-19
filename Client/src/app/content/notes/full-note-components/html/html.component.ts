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


  buttonHandler($event)
  {
    $event.preventDefault();
  }

  preventClick($event)
  {
    $event.preventDefault();
  }

  async onInput(event) {
    this.visible = this.isContentEmpty();
    this.textClearing();
  }


  textClearing()
  {
   if (this.isContentEmpty())
   {
     this.contentHtml.nativeElement.innerHTML = '';
   }
  }

  // PLACEHOLDER VISIBLE
  isContentEmpty()
  {
    return this.contentHtml.nativeElement.textContent.length === 0;
  }

  mouseEnter($event)
  {
    this.visible = true && this.isContentEmpty();
  }

  mouseOut($event)
  {
    this.visible = (document.activeElement === this.contentHtml.nativeElement) && this.isContentEmpty();
  }

  onBlur($event)
  {
    this.visible = false;
  }

  setFocus($event?)
  {
    this.contentHtml.nativeElement.focus();
    this.visible = true && this.isContentEmpty();
  }

}
