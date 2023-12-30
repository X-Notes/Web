import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TextBackgroundColorsDark, TextBackgroundColorsDarkAnimals } from 'src/app/shared/enums/text-background-colors.enum';
import { TextColorsDark, TextColorsDarkAnimals } from 'src/app/shared/enums/text-colors.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { TextEditMenuOptions } from './models/text-edit-menu-options';
import { TransformContent } from '../../entities-ui/transform-content.model';
import { UpdateTextStyles, TextStyles, TextUpdateValue } from '../../entities-ui/text-edit-menu/update-texts-styles';
import { HeadingTypeENUM } from '../../entities/contents/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../../entities/contents/text-models/note-text-type.enum';
import { UpdateTextStyle } from '../../entities-ui/text-edit-menu/update-text-style';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-text-edit-menu',
  templateUrl: './text-edit-menu.component.html',
  styleUrls: ['./text-edit-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextEditMenuComponent implements OnInit {

  _options: TextEditMenuOptions;

  @Output()
  eventTransform = new EventEmitter<TransformContent>();

  @Output()
  updateText = new EventEmitter<UpdateTextStyles>();

  @Output()
  updateSelectedText = new EventEmitter<UpdateTextStyle>();

  @Input() set options(options: TextEditMenuOptions) {
    this._options = options;
    this.link = options?.link;
    this.hasInitialLink = this.link?.length > 0;
  }

  @Output()
  changeLinkMenuState = new EventEmitter<boolean>();

  @ViewChild('linkMenuTrigger' , { read: MatMenuTrigger }) linkMenuTrigger: MatMenuTrigger;

  @ViewChild('linkInput') linkInput: ElementRef<HTMLInputElement>;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  textType = NoteTextTypeENUM;

  headingType = HeadingTypeENUM;

  textColorPalete = Object.entries(TextColorsDark);

  textBackgroundPalete = Object.entries(TextBackgroundColorsDark);

  backgroundsAnimals = TextBackgroundColorsDarkAnimals;

  textsAnimals = TextColorsDarkAnimals;

  link: string;

  hasInitialLink: boolean;

  ngOnInit(): void {}

  preventUnSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
  
  get maxHeight(): string {
    return (window.visualViewport.height / 2.5) + 'px';
  }

  updateLink($event: MouseEvent): void {
    this.updateOneText('link', this.link);
    this.linkMenuTrigger?.closeMenu();
  }

  deleteLink($event: MouseEvent): void {
    this.updateOneText('link', '');
    this.linkMenuTrigger?.closeMenu();
  }

  updateOneText(textStyle: TextStyles, value: string): void {
    const obj = {
      selection: this._options.selection,
      content: this._options.elements[0],
      isRemoveStyles: false,
      textStyle,
      value
    } as UpdateTextStyle; 
    this.updateSelectedText.emit(obj);
  }

  transformContent(e, type: NoteTextTypeENUM, heading?: HeadingTypeENUM): void {
    if (!this._options) return;
    if (this._options.textType === type && this._options.headingType === heading) {
      this.eventTransform.emit({
        content: this._options.elements[0],
        textType: NoteTextTypeENUM.default,
        setFocusToEnd: true,
      });
    } else {
      const textType =
        type === this._options.textType && type !== NoteTextTypeENUM.heading
          ? NoteTextTypeENUM.default
          : type;
      this.eventTransform.emit({
        content: this._options.elements[0],
        textType,
        headingType: heading,
        setFocusToEnd: true,
      });
    }
  }

  menuOpened(): void {
    this.changeLinkMenuState.emit(true);
  }

  menuClosed(): void {
    this.changeLinkMenuState.emit(false);
  }

  setBoldStyle($event): void {
    $event.preventDefault();
    this.updateStyles('bold', !this._options.isBold);
  }

  setItalicStyle($event) {
    $event.preventDefault();
    this.updateStyles('italic', !this._options.isItalic);
  }

  setTextColor(value: string = null) {
    this.updateStyles('color', value);
  }

  setBackground(value: string = null) {
    this.updateStyles('background', value);
  }

  updateStyles(textStyle: TextStyles, value: TextUpdateValue): void {
    if (value === TextColorsDark.Default || value === TextBackgroundColorsDark.Default) {
      value = false;
    }
    this.updateText.emit({
      contents: this._options.elements,
      textStyle,
      value,
    });
  }

}
