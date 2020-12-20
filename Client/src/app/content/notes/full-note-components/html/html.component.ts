import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { type } from 'os';
import { ContentEditableService } from '../../content-editable.service';
import { LineBreakType } from '../../html-models';
import { ContentModel, Html } from '../../models/ContentMode';

@Component({
  selector: 'app-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss']
})
export class HtmlComponent implements OnInit {

  @ViewChild('contentHtml') contentHtml: ElementRef;

  visible = false;

  @Output()
  enterEvent = new EventEmitter<{ id: string, typeBreak: LineBreakType, html?: DocumentFragment}>();

  @Input()
  content: ContentModel<Html>;

  constructor(private contEditService: ContentEditableService) { }

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

  async enter($event)
  {
    $event.preventDefault();
    const model = this.contEditService.enterService(this.contentHtml);
    this.enterEvent.emit({ id : this.content.contentId, typeBreak : model.typeBreakLine, html: model.nextContent});
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
