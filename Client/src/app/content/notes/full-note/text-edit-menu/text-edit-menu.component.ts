import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TextBackgroundColors } from 'src/app/shared/enums/text-background-colors.enum';
import { TextColors } from 'src/app/shared/enums/text-colors.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { HeadingTypeENUM } from '../../models/editor-models/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { TextStyles, TextUpdateValue, UpdateTextStyles } from '../../models/update-text-styles';
import { TransformContent } from '../models/transform-content.model';
import { TextEditMenuOptions } from './models/text-edit-menu-options';

@Component({
  selector: 'app-text-edit-menu',
  templateUrl: './text-edit-menu.component.html',
  styleUrls: ['./text-edit-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextEditMenuComponent {
  @Output()
  eventTransform = new EventEmitter<TransformContent>();

  @Output()
  updateText = new EventEmitter<UpdateTextStyles>();

  @Input()
  options: TextEditMenuOptions;

  @Input()
  theme: ThemeENUM;

  textType = NoteTextTypeENUM;

  headingType = HeadingTypeENUM;

  textColorPalete = Object.entries(TextColors);

  textBackgroundPalete = Object.entries(TextBackgroundColors);

  preventUnSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  transformContent(e, type: NoteTextTypeENUM, heading?: HeadingTypeENUM): void {
    if (!this.options) return;
    if (this.options.textType === type && this.options.headingType === heading) {
      this.eventTransform.emit({
        id: this.options.ids[0],
        textType: NoteTextTypeENUM.default,
        setFocusToEnd: true,
      });
    } else {
      const textType =
        type === this.options.textType && type !== NoteTextTypeENUM.heading
          ? NoteTextTypeENUM.default
          : type;
      this.eventTransform.emit({
        id: this.options.ids[0],
        textType,
        headingType: heading,
        setFocusToEnd: true,
      });
    }
  }

  setBoldStyle($event): void {
    $event.preventDefault();
    this.updateStyles('bold', !this.options.isBold);
  }

  setItalicStyle($event) {
    $event.preventDefault();
    this.updateStyles('italic', !this.options.isItalic);
  }

  setTextColor(value: string = null) {
    this.updateStyles('color', value);
  }

  setBackground(value: string = null) {
    this.updateStyles('background', value);
  }

  updateStyles(textStyle: TextStyles, value: TextUpdateValue): void {
    let isRemoveStyles = false;
    if (value === TextColors.Default || value === TextBackgroundColors.Default) {
      value = null;
      isRemoveStyles = true;
    }
    this.updateText.emit({
      ids: this.options.ids,
      textStyle,
      value,
      isRemoveStyles,
    });
  }
}
