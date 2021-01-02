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

  @Output()
  deleteThis = new EventEmitter<string>();

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

  onSelect($event){

  }


  async enter($event)
  {
    $event.preventDefault();
    const model = this.contEditService.enterService(this.contentHtml);
    this.enterEvent.emit({ id : this.content.contentId, typeBreak : model.typeBreakLine, html: model.nextContent});
  }

  async back($event: KeyboardEvent) {
    if (this.isContentEmpty())
    {
      this.deleteThis.emit(this.content.contentId);
    }
    if (this.isContentOneSymbol())
    {
      this.visible = true;
      this.contentHtml.nativeElement.innerHTML = '';
    }
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
  isContentOneSymbol()
  {
    return this.contentHtml.nativeElement.textContent === ' ';
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

  setFocusToEnd()
  {
    this.contEditService.setCursor(this.contentHtml, false);
    this.visible = true && this.isContentEmpty();
  }

}
