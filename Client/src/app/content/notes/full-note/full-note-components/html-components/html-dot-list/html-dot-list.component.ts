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
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/note-text-type.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ClickableContentService } from '../../../content-editor-services/clickable-content.service';
import { SelectionService } from '../../../content-editor-services/selection.service';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content.model';
import { BaseTextElementComponent } from '../html-base.component';

@Component({
  selector: 'app-html-dot-list',
  templateUrl: './html-dot-list.component.html',
  styleUrls: ['./html-dot-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlDotListComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction
{
  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  constructor(
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    apiBrowserTextService: ApiBrowserTextService,
    selectionService: SelectionService,
    clickableService: ClickableContentService,
    renderer: Renderer2,
  ) {
    super(cdr, apiBrowserTextService, selectionService, clickableService, renderer);
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
    if (this.isContentEmpty()) {
      this.transformTo.emit({
        id: this.content.id,
        textType: NoteTextTypeENUM.Default,
        setFocusToEnd: true,
      });
    } else {
      const breakModel = this.apiBrowser.pressEnterHandler(this.getEditableNative());
      const event = super.eventEventFactory(breakModel, NoteTextTypeENUM.Dotlist, this.content.id);
      this.enterEvent.emit(event);
    }
  }
}
