import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ENTER } from '@angular/cdk/keycodes';
import { showDropdown } from '../../services/personalization.service';
import { SelectService } from '../../services/select.service';
import { SelectOptionComponent } from '../select-option/select-option.component';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  animations: [showDropdown],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
    SelectService,
  ],
})
export class SelectComponent implements OnInit, AfterContentInit, OnChanges {
  @ContentChildren(SelectOptionComponent)
  public options: QueryList<SelectOptionComponent>;

  @Input()
  @Optional()
  translate: string;

  @Input()
  @Optional()
  selectValue: any;

  @Input()
  @Optional()
  selectObjectProperty: string;

  @Output()
  selectValueChange = new EventEmitter<string>();

  isOpen = false;

  selected: string;

  public selectedOption: SelectOptionComponent;

  public positions = [
    new ConnectionPositionPair(
      {
        originX: 'end',
        originY: 'bottom',
      },
      { overlayX: 'end', overlayY: 'top' },
      0,
      1,
    ),
  ];

  private keyManager: ActiveDescendantKeyManager<SelectOptionComponent>;

  constructor(private selectService: SelectService) {
    this.selectService.register(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes: ', changes);
  }

  ngOnInit(): void {
    console.log('selectValue: ', this.selectValue);
  }

  ngAfterContentInit(): void {
    requestAnimationFrame(() => {
      this.keyManager = new ActiveDescendantKeyManager(this.options).withWrap();
      if (!this.selectValue) return;
      if (typeof this.selectValue === 'object') {
        this.selectedOption = this.options
          .toArray()
          .find(
            (option) =>
              option.value[this.selectObjectProperty] ===
              this.selectValue[this.selectObjectProperty],
          );
        this.selected = this.selectedOption
          ? this.selectedOption.value[this.selectObjectProperty]
          : '';
      } else {
        this.selectedOption = this.options
          .toArray()
          .find((option) => option.value === this.selectValue);
        this.selected = this.selectedOption ? this.selectedOption.value : '';
      }
      this.keyManager.setActiveItem(this.options.toArray().indexOf(this.selectedOption));
    });
  }

  onKeydown(event) {
    if (event.keyCode === ENTER && this.keyManager.activeItem?.value !== this.selected) {
      this.selectOption(this.keyManager.activeItem);
      this.closeDropdown();
    } else {
      this.keyManager.onKeydown(event);
    }
  }

  public selectOption(option: SelectOptionComponent) {
    this.keyManager.setActiveItem(option);
    this.selectedOption = option;
    if (typeof this.selectedOption.value === 'object') {
      this.selected = this.selectedOption
        ? this.selectedOption.value[this.selectObjectProperty]
        : '';
    } else {
      this.selected = this.selectedOption ? this.selectedOption.value : '';
    }
    this.selectValueChange.emit(this.selectedOption.value);
    this.closeDropdown();
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
