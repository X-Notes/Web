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
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { EnterEvent } from '../../../models/enter-event.model';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { SetFocus } from '../../../models/set-focus';
import { TransformContent } from '../../../models/transform-content.model';
import { HtmlBaseService } from '../html-base.service';
import { DotListService } from '../html-business-logic/dot-list.service';

@Component({
  selector: 'app-html-dot-list',
  templateUrl: './html-dot-list.component.html',
  styleUrls: ['./html-dot-list.component.scss'],
  providers: [DotListService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlDotListComponent
  extends HtmlBaseService
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {
  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onFocus = new EventEmitter<HtmlDotListComponent>();

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  constructor(
    public dotListService: DotListService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
  ) {
    super(cdr);
  }

  get isActive() {
    return this.dotListService.isActive(this.contentHtml);
  }

  getHost() {
    return this.host;
  }

  ngAfterViewInit(): void {
    this.dotListService.setHandlers(
      this.content,
      this.contentHtml,
      this.enterEvent,
      this.concatThisWithPrev,
      this.deleteThis,
    );
  }

  ngOnDestroy(): void {
    this.dotListService.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.initBaseHTML();
    this.dotListService.transformTo = this.transformTo;
  }

  isFocusToNext = () => true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFocus(entity: SetFocus) {
    this.dotListService.setFocus(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  setFocusToEnd() {
    this.dotListService.setFocusToEnd(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  mouseEnter($event) {
    $event.preventDefault();
    this.dotListService.mouseEnter($event, this.contentHtml);
    this.isMouseOver = true;
  }

  mouseLeave($event) {
    this.dotListService.mouseLeave($event, this.contentHtml);
    this.isMouseOver = false;
  }

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}
}
