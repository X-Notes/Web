import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { BaseTextElementComponent } from '../html-base.component';
import { SetFocus } from 'src/app/editor/entities-ui/set-focus';
import { HtmlComponentsFacadeService } from '../../html-components.facade.service';
import { NoteTextTypeENUM } from 'src/app/editor/entities/contents/text-models/note-text-type.enum';
import { ClickableSelectableEntities } from 'src/app/editor/entities-ui/clickable-selectable-entities.enum';
import * as hljs from 'highlight.js';

@Component({
  selector: 'app-html-code',
  templateUrl: './html-code.component.html',
  styleUrls: ['./html-code.component.scss', '../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlCodeComponent extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    facade: HtmlComponentsFacadeService) {
    super(cdr, facade);
  }

  onInput(): void {
    const text = this.contentHtml.nativeElement.innerText;
    const html = hljs.default.highlightAuto(text);
    const convertedHTML = this.facade.sanitizer.bypassSecurityTrustHtml(html.value) ?? '';
    const selection = this.getSelection();
    this.facade.apiBrowser.removeAllRanges();
    this.viewHtml = convertedHTML as string;
    if(selection) {
      setTimeout(() => {
        this.restoreSelection(selection);
      }, 0);
    }
    this.textChanged.next();
    // this.handleUndoTextAction(this.content);
    // this.initContentFromHTML(this.contentHtml.nativeElement.innerHTML);
    // this.textChanged.next();
    // this.facade.clickableService.cursorChanged$.next(() => this.updateContentEditableCursor());
  }

  enter($event: any) {
    $event.stopImmediatePropagation();
    console.log(555);
  }

  setFocusedElement(): void {
    this.facade.clickableService.setContent(
      this.content,
      null,
      ClickableSelectableEntities.Text,
      this,
    );
  }

  isFocusToNext = () => true;

  pasteCommandHandler(e: ClipboardEvent) {
    console.log('eee: ', e);
  }

  getHost() {
    return this.host;
  }

  backspaceUp() { }

  backspaceDown() { }

  deleteDown() { }

  get cursorShift(): { top: number; left: number; } {
    throw new Error('Method not implemented.');
  }


  ngOnDestroy(): void {
    this.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngAfterViewInit(): void {
    this.setHandlers();
  }

  ngOnInit(): void {
    this.initBaseHTML();
  }

  initBaseHTML(): void {
    const s = `  initBaseHTML(): void {
      const html = hljs.default.highlightAuto(
      hljs = require('highlight.js');
      html = hljs.highlightAuto('<h1>Hello World!</h1>').value);
      console.log('html: ', html);
      const convertedHTML = this.facade.sanitizer.bypassSecurityTrustHtml(html.value) ?? '';
      this.viewHtml = convertedHTML as string;
      this.textChanged.next();
    }`;
    const html = hljs.default.highlightAuto(s);
    console.log('html: ', html);
    const convertedHTML = this.facade.sanitizer.bypassSecurityTrustHtml(html.value) ?? '';
    this.viewHtml = convertedHTML as string;
    this.textChanged.next();
  }
}
