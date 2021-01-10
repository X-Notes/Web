import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { ContentEditableService } from '../../content-editable.service';
import { LineBreakType } from '../../html-models';
import { MenuSelectionService } from '../../menu-selection.service';
import { ContentModel, Html, HtmlType } from '../../models/ContentMode';
import { SelectionService } from '../../selection.service';

@Component({
  selector: 'app-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss']
})
export class HtmlComponent implements OnInit, AfterViewInit {

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
    this.renderer.listen(this.getFirstChild, 'input', (e) => { this.onInput(e); });
    this.renderer.listen(this.getFirstChild, 'blur', (e) => { this.onBlur(e); });
    this.renderer.listen(this.getFirstChild, 'paste', (e) => { this.pasteCommandHandler(e); });
    this.renderer.listen(this.getFirstChild, 'mouseup', (e) => { this.mouseUp(e); });
    this.renderer.listen(this.getFirstChild, 'selectstart', (e) => { this.onSelectStart(e); });
    this.renderer.listen(this.getFirstChild, 'keydown.enter', (e) => { this.enter(e); });
    this.renderer.listen(this.getFirstChild, 'keydown.backspace', (e) => { this.backDown(e); });
    this.renderer.listen(this.getFirstChild, 'keyup.backspace', (e) => { this.backUp(e); });
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

  get getFirstChild() {
    return this.contentHtml.nativeElement.children[0];
  }

  async onInput(event): Promise<void> {
    this.content.data.html = this.getFirstChild.innerText;
    this.visible = this.isContentEmpty();
    this.textClearing();
  }

  updateHTML(html: string) {
    this.content.data.html = html; // TODO MAYBER NO NEED
    this.getFirstChild.innerHTML = html;
  }

  onSelectStart($event) {
    console.log('selection start');
  }


  pasteCommandHandler(e) {
    this.apiBrowserService.pasteCommandHandler(e);
  }

  async enter($event) {
    $event.preventDefault();
    const model = this.contEditService.enterService(this.getFirstChild);
    this.content.data.html = this.getFirstChild.innerHTML;
    this.enterEvent.emit({ id: this.content.contentId, typeBreak: model.typeBreakLine, html: model.nextContent });
  }

  async backDown($event: KeyboardEvent) {

    const selection = this.apiBrowserService.getSelection().toString();
    if (this.contEditService.isStart(this.getFirstChild) && !this.isContentEmpty() && selection === '') {
      $event.preventDefault();
      this.concatThisWithPrev.emit(this.content.contentId);
    }

    if (this.isContentEmpty()) {
      this.deleteThis.emit(this.content.contentId);
    }

  }


  async backUp($event: KeyboardEvent) {

  }


  textClearing() {
    if (this.isContentEmpty()) {
      this.getFirstChild.innerHTML = '';
    }
  }

  // PLACEHOLDER VISIBLE
  isContentEmpty() {
    return this.getFirstChild.textContent.length === 0;
  }
  isContentOneSymbol() {
    return this.getFirstChild.textContent === ' ';
  }

  mouseEnter($event) {
    this.visible = true && this.isContentEmpty() && !this.selectionService.ismousedown;
  }

  mouseOut($event) {
    this.visible = (document.activeElement === this.getFirstChild) && this.isContentEmpty();
  }

  onBlur($event) {
    this.visible = false;
    this.menuSelectionService.menuActive = false;
  }

  setFocus($event?) {
    this.getFirstChild.focus();
    this.visible = true && this.isContentEmpty();
  }

  setFocusToEnd() {
    this.contEditService.setCursor(this.getFirstChild, false);
    this.visible = true && this.isContentEmpty();
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
