import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { HeadingTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/heading-type.enum';
import { NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/note-text-type.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ClickableSelectableEntities } from '../../../content-editor-services/models/clickable-selectable-entities.enum';
import { HtmlComponentsFacadeService } from '../../html-components-services/html-components.facade.service';
import { BaseTextElementComponent } from '../html-base.component';

@Component({
  selector: 'app-html-headings',
  templateUrl: './html-headings.component.html',
  styleUrls: ['./html-headings.component.scss', '../../../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlHeadingsComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  hType = HeadingTypeENUM;

  constructor(
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    facade: HtmlComponentsFacadeService,
  ) {
    super(cdr, facade);
  }

  get cursorClass(): string {
    switch (this.content.headingTypeId) {
      case HeadingTypeENUM.H1: {
        return 'cursor-h1';
      }
      case HeadingTypeENUM.H2: {
        return 'cursor-h2';
      }
      case HeadingTypeENUM.H3: {
        return 'cursor-h3';
      }
      default: {
        return null;
      }
    }
  }

  get cursorShift() {
    switch (this.content.headingTypeId) {
      case HeadingTypeENUM.H1: {
        return { top: 4, left: 5 };
      }
      case HeadingTypeENUM.H2: {
        return { top: 5, left: 5 };
      }
      case HeadingTypeENUM.H3: {
        return { top: 4, left: 5 };
      }
      default: {
        return { top: 0, left: 0 };
      }
    }
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
    const breakModel = this.facade.apiBrowser.pressEnterHandler(this.getEditableNative());
    const event = super.eventEventFactory(breakModel, NoteTextTypeENUM.default, this.content.id);
    this.enterEvent.emit(event);
  }

  setFocusedElement(): void {
    this.facade.clickableService.setContent(
      this.content,
      null,
      ClickableSelectableEntities.Text,
      this,
    );
  }
}
