import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { ContentEditableService } from '../../content-editable.service';
import { MenuSelectionService } from '../../menu-selection.service';
import { ContentModel, HtmlText } from '../../models/ContentMode';
import { EnterEvent } from '../../models/enterEvent';
import { SelectionService } from '../../selection.service';

@Component({
  selector: 'app-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss']
})
export class HtmlComponent implements OnInit {


  @ViewChild('contentHtml') contentHtml: ElementRef;

  startStr = '';
  visible = false;

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @Input()
  content: ContentModel<HtmlText>;

  contentType = null;

  constructor(private contEditService: ContentEditableService,
              private apiBrowserService: ApiBrowserTextService,
              private selectionService: SelectionService,
              public menuSelectionService: MenuSelectionService,
              private renderer: Renderer2) {
  }


  ngOnInit(): void {
    this.startStr = this.content.data.content;
  }

  buttonHandler($event) {
    $event.preventDefault();
  }

  preventClick($event) {
    $event.preventDefault();
  }


  async onInput(event): Promise<void> {
    this.content.data.content = this.getTextChild.innerText;
    if (this.isContentEmpty) {
      this.getTextChild.innerHTML = '';
    }
    this.visible = this.isContentEmpty;
  }

  updateHTML(html: string) {
    this.content.data.content = html; // TODO MAYBER NO NEED
    this.getTextChild.innerHTML = html;
  }

  onSelectStart($event) {
    console.log('selection start');
  }


  pasteCommandHandler(e) {
    this.apiBrowserService.pasteCommandHandler(e);
  }

  async enter($event) {
    /*
    $event.preventDefault();
    const model = this.contEditService.enterService(this.getTextChild);
    this.content.data.html = this.getTextChild.innerHTML;

    const eventModel: EnterEvent = {
        id: this.content.contentId,
        typeBreak: model.typeBreakLine,
        html: model.nextContent, itemType: HtmlType.Text
    };
    if (this.isContentEmpty && this.content.data.type === HtmlType.DOTLIST)
    {
      this.content.data.type = HtmlType.Text;
      setTimeout(() => {
        this.setHandlers();
        this.setFocus();
      });
    }else{
      this.getService.enter(this.enterEvent, eventModel);
    }*/
  }

  async backDown($event: KeyboardEvent) {

    const selection = this.apiBrowserService.getSelection().toString();
    if (this.contEditService.isStart(this.getTextChild) && !this.isContentEmpty && selection === '') {
      $event.preventDefault();
      this.concatThisWithPrev.emit(this.content.contentId);
    }

    if (this.isContentEmpty) {
      $event.preventDefault();
      this.deleteThis.emit(this.content.contentId);
    }

  }


  async backUp($event: KeyboardEvent) {

  }



  // PLACEHOLDER VISIBLE
  get isContentEmpty() {
    return null;
  }

  get getTextChild() {
    return null;
  }

  mouseEnter($event) {
    this.visible = true && this.isContentEmpty && !this.selectionService.ismousedown;
  }

  mouseOut($event) {
    this.visible = (document.activeElement === this.getTextChild) && this.isContentEmpty;
  }

  onBlur($event) {
    this.visible = false;
    this.menuSelectionService.menuActive = false;
  }

  setFocus($event?) {
    this.getTextChild.focus();
    this.visible = true && this.isContentEmpty;
  }

  setFocusToEnd() {
    this.contEditService.setCursor(this.getTextChild, false);
    this.visible = true && this.isContentEmpty;
  }

  mouseUp($event: MouseEvent) {
    const selection = this.apiBrowserService.getSelection();
    if (selection.toString() !== '') {
      const coords = selection.getRangeAt(0).getBoundingClientRect();
      this.menuSelectionService.menuActive = true;
      this.menuSelectionService.left = ((coords.left + coords.right) / 2) - this.selectionService.sidebarWidth;
      this.menuSelectionService.top = coords.top - this.selectionService.menuHeight - 45;
    } else {
      this.menuSelectionService.menuActive = false;
    }
  }
}
