import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { BaseText, HeadingTypeENUM } from '../../../../models/content-model.model';
import { EditTextEventModel } from '../../../models/edit-text-event.model';
import { EnterEvent } from '../../../models/enter-event.model';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { HeadingService } from '../../html-business-logic/heading.service';

@Component({
  selector: 'app-html-headings',
  templateUrl: './html-headings.component.html',
  styleUrls: ['./html-headings.component.scss'],
  providers: [HeadingService],
})
export class HtmlHeadingsComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {
  @Output()
  updateText = new EventEmitter<EditTextEventModel>();

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @Input()
  content: BaseText;

  @ViewChild('contentHtml') contentHtml: ElementRef;

  hType = HeadingTypeENUM;

  textChanged: Subject<string> = new Subject<string>();

  destroy = new Subject<void>();

  constructor(public headingService: HeadingService) {}

  getContent() {
    return this.content;
  }

  ngAfterViewInit(): void {
    this.headingService.setHandlers(
      this.content,
      this.contentHtml,
      this.enterEvent,
      this.concatThisWithPrev,
      this.deleteThis,
    );
  }

  ngOnDestroy(): void {
    this.headingService.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.textChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((str) => {
        this.content.content = str;
        this.updateText.emit({ content: str, contentId: this.content.id });
      });
  }

  setFocus($event?) {
    this.headingService.setFocus($event, this.contentHtml);
  }

  setFocusToEnd() {
    this.headingService.setFocusToEnd(this.contentHtml);
  }

  updateHTML(content: string) {
    this.content.content = content;
    this.contentHtml.nativeElement.innerHTML = content;
  }

  getNative() {
    return this.contentHtml?.nativeElement;
  }

  mouseEnter($event) {
    this.headingService.mouseEnter($event, this.contentHtml);
  }

  mouseOut($event) {
    this.headingService.mouseOut($event, this.contentHtml);
  }

  get isActive() {
    return this.headingService.isActive(this.contentHtml);
  }

  onInput($event) {
    this.textChanged.next($event.target.innerText);
  }
}
