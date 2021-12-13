/* eslint-disable @typescript-eslint/no-useless-constructor */
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { BaseText } from '../../../models/editor-models/base-text';
import { DeltaConverter } from '../../content-editor/converter/delta-converter';
import { BaseHtmlComponent } from '../base-html-components';
import { InputHtmlEvent } from './models/input-html-event';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class HtmlBaseService extends BaseHtmlComponent {
  @Input()
  content: BaseText;
  
  @Output()
  inputHtmlEvent = new EventEmitter<InputHtmlEvent>();

  @ViewChild('contentHtml') contentHtml: ElementRef;

  textChanged: Subject<string> = new Subject<string>();

  destroy = new Subject<void>();

  viewHtml: string;

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);

    this.textChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((html) => {
        this.inputHtmlEvent.emit({ content: this.content, html });
      });
  }

  onInput($event) {
    this.textChanged.next(this.contentHtml.nativeElement.innerHTML);
  }

  get html(): string {
    const delta = DeltaConverter.convertToDelta(this.content.contents);
    return DeltaConverter.convertDeltaToHtml(delta);
  }

  initBaseHTML(): void {
    this.viewHtml = this.html;
  }

  updateHTML(html: string) {
    this.contentHtml.nativeElement.innerHTML = html;
    this.textChanged.next(html);
  }

  syncHtmlWithLayout() {
    this.textChanged.next(this.contentHtml.nativeElement.innerHTML);
  }
}
