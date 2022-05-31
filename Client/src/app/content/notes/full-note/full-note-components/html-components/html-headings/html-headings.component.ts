import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { HeadingTypeENUM } from 'src/app/content/notes/models/editor-models/base-text';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { EnterEvent } from '../../../models/enter-event.model';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { SetFocus } from '../../../models/set-focus';
import { HtmlBaseService } from '../html-base.service';
import { HeadingService } from '../html-business-logic/heading.service';

@Component({
  selector: 'app-html-headings',
  templateUrl: './html-headings.component.html',
  styleUrls: ['./html-headings.component.scss'],
  providers: [HeadingService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlHeadingsComponent
  extends HtmlBaseService
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction
{
  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onFocus = new EventEmitter<HtmlHeadingsComponent>();

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  hType = HeadingTypeENUM;

  constructor(
    public headingService: HeadingService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    apiBrowserTextService: ApiBrowserTextService,
  ) {
    super(cdr, apiBrowserTextService);
  }

  get isActive() {
    return this.headingService.isActive(this.contentHtml);
  }

  getHost() {
    return this.host;
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
    this.initBaseHTML();
  }

  isFocusToNext = () => true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFocus(entity: SetFocus) {
    this.headingService.setFocus(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  setFocusToEnd() {
    this.headingService.setFocusToEnd(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  mouseEnter($event) {
    this.headingService.mouseEnter($event, this.contentHtml);
    this.isMouseOver = true;
  }

  mouseLeave($event) {
    this.headingService.mouseLeave($event, this.contentHtml);
    this.isMouseOver = false;
  }

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}
}
