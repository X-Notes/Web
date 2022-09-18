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
  Renderer2,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { HeadingTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/heading-type.enum';
import { NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/note-text-type.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ClickableContentService } from '../../../content-editor-services/clickable-content.service';
import { SelectionService } from '../../../content-editor-services/selection.service';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { BaseTextElementComponent } from '../html-base.component';

@Component({
  selector: 'app-html-headings',
  templateUrl: './html-headings.component.html',
  styleUrls: ['./html-headings.component.scss', '../../../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlHeadingsComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction
{
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onFocus = new EventEmitter<HtmlHeadingsComponent>();

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  hType = HeadingTypeENUM;

  constructor(
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    apiBrowserTextService: ApiBrowserTextService,
    selectionService: SelectionService,
    clickableService: ClickableContentService,
    renderer: Renderer2,
    sanitizer: DomSanitizer,
  ) {
    super(cdr, apiBrowserTextService, selectionService, clickableService, renderer, sanitizer);
  }

  getHost() {
    return this.host;
  }

  ngAfterViewInit(): void {
    this.setHandlers();
  }

  ngOnDestroy(): void {
    this.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.initBaseHTML();
  }

  isFocusToNext = () => true;

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}

  enter($event: any) {
    $event.preventDefault();
    const breakModel = this.apiBrowser.pressEnterHandler(this.getEditableNative());
    const event = super.eventEventFactory(breakModel, NoteTextTypeENUM.Default, this.content.id);
    this.enterEvent.emit(event);
  }
}
