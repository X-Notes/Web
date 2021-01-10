import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { ContentEditableService } from '../../content-editable.service';
import { LineBreakType } from '../../html-models';
import { MenuSelectionService } from '../../menu-selection.service';
import { ContentModel, Html, HtmlType } from '../../models/ContentMode';
import { SelectionService } from '../../selection.service';
import { HtmlCommandsAbstract } from '../html-business-logic/command-interface';
import { TextService } from '../html-business-logic/default-text.service';
import { DotListService } from '../html-business-logic/dotList.service';

@Component({
  selector: 'app-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss']
})
export class HtmlComponent implements OnInit, AfterViewInit {

  commandsService: HtmlCommandsAbstract;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  startStr = '';
  visible = false;

  @Output()
  enterEvent = new EventEmitter<{ id: string, typeBreak: LineBreakType, html?: DocumentFragment }>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @Input()
  content: ContentModel<Html>;

  contentType = HtmlType;

  constructor(private contEditService: ContentEditableService,
              private apiBrowserService: ApiBrowserTextService,
              private selectionService: SelectionService,
              public menuSelectionService: MenuSelectionService,
              private renderer: Renderer2) {
  }


  ngAfterViewInit(): void {
    const htmlType = this.content.data.type;
    if (htmlType ===  HtmlType.Text || htmlType === HtmlType.H1 || htmlType === HtmlType.H2 || htmlType === HtmlType.H3)
    {
      this.commandsService = new TextService(this.apiBrowserService, this.selectionService, this.menuSelectionService);
    }
    else if (htmlType === HtmlType.DOTLIST)
    {
      this.commandsService = new DotListService(this.apiBrowserService, this.selectionService, this.menuSelectionService);
    }

    this.renderer.listen(this.getTextChild, 'input', (e) => { this.onInput(e); });
    this.renderer.listen(this.getTextChild, 'blur', (e) => { this.onBlur(e); });
    this.renderer.listen(this.getTextChild, 'paste', (e) => { this.pasteCommandHandler(e); });
    this.renderer.listen(this.getTextChild, 'mouseup', (e) => { this.mouseUp(e); });
    this.renderer.listen(this.getTextChild, 'selectstart', (e) => { this.onSelectStart(e); });
    this.renderer.listen(this.getTextChild, 'keydown.enter', (e) => { this.enter(e); });
    this.renderer.listen(this.getTextChild, 'keydown.backspace', (e) => { this.backDown(e); });
    this.renderer.listen(this.getTextChild, 'keyup.backspace', (e) => { this.backUp(e); });
  }

  ngOnInit(): void {
    this.startStr = this.content.data.html;
  }


  buttonHandler($event) {
    $event.preventDefault();
  }

  preventClick($event) {
    $event.preventDefault();
  }


  async onInput(event): Promise<void> {
    this.content.data.html = this.getTextChild.innerText;
    this.visible = this.isContentEmpty;
    if (this.isContentEmpty) {
      this.getTextChild.innerHTML = '';
    }
  }

  updateHTML(html: string) {
    this.content.data.html = html; // TODO MAYBER NO NEED
    this.getTextChild.innerHTML = html;
  }

  onSelectStart($event) {
    console.log('selection start');
  }


  pasteCommandHandler(e) {
    this.apiBrowserService.pasteCommandHandler(e);
  }

  async enter($event) {
    $event.preventDefault();
    const model = this.contEditService.enterService(this.getTextChild);
    this.content.data.html = this.getTextChild.innerHTML;
    this.enterEvent.emit({ id: this.content.contentId, typeBreak: model.typeBreakLine, html: model.nextContent });
  }

  async backDown($event: KeyboardEvent) {

    const selection = this.apiBrowserService.getSelection().toString();
    if (this.contEditService.isStart(this.getTextChild) && !this.isContentEmpty && selection === '') {
      $event.preventDefault();
      this.concatThisWithPrev.emit(this.content.contentId);
    }

    if (this.isContentEmpty) {
      this.deleteThis.emit(this.content.contentId);
    }

  }


  async backUp($event: KeyboardEvent) {

  }



  // PLACEHOLDER VISIBLE
  get isContentEmpty() {
    return this.commandsService.isContentEmpty(this.contentHtml);
  }

  isContentOneSymbol() {
    return this.getTextChild.textContent === ' ';
  }

  get getTextChild() {
    return this.commandsService.getContentChild(this.contentHtml);
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
    console.log('focus');
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
