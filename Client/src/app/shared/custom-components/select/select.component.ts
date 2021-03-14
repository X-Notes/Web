import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  forwardRef,
  Input,
  Optional,
  Output,
  QueryList,
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
export class SelectComponent implements AfterViewInit {
  @ContentChildren(SelectOptionComponent)
  public options: QueryList<SelectOptionComponent>;

  @Input()
  @Optional()
  translate: string;

  @Input()
  @Optional()
  selectValue: string;

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

  ngAfterViewInit(): void {
    this.keyManager = new ActiveDescendantKeyManager(this.options).withWrap();
    console.log(this.options);
    setTimeout(() => {
      this.selectedOption = this.options
        .toArray()
        .find((option) => option.value.toLowerCase() === this.selectValue);
      this.selected = this.selectedOption ? this.selectedOption.value : '';
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
    this.selected = this.selectedOption ? this.selectedOption.value : '';
    this.selectValueChange.emit(this.selected);
    this.closeDropdown();
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
