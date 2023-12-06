import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ClickableSelectableEntities } from 'src/app/editor/entities-ui/clickable-selectable-entities.enum';
import { HeadingTypeENUM } from 'src/app/editor/entities/contents/text-models/heading-type.enum';
import { NoteTextTypeENUM } from 'src/app/editor/entities/contents/text-models/note-text-type.enum';
import { HtmlComponentsFacadeService } from '../../html-components.facade.service';
import { BaseTextElementComponent } from '../html-base.component';

@Component({
  selector: 'app-html-headings',
  templateUrl: './html-headings.component.html',
  styleUrls: ['./html-headings.component.scss', '../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlHeadingsComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  hType = HeadingTypeENUM;

  constructor(
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    facade: HtmlComponentsFacadeService,
  ) {
    super(cdr, facade);
  }

  get cursorClass(): string {
    switch (this.content.metadata?.hTypeId) {
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

  get textPlaceholderPadding(): string {
    return this.textPaddingNumber + 0 + 'px';
  }

  get cursorShift() {
    switch (this.content.metadata?.hTypeId) {
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
    $event.stopPropagation();
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
