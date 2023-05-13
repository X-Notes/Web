import { ConnectionPositionPair } from '@angular/cdk/overlay';
import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { showDropdown } from 'src/app/shared/services/personalization.service';
import { SelectOptionComponent } from '../select-option/select-option.component';
import { SelectionOption } from '../entities/select-option';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  animations: [showDropdown],
})
export class SelectComponent implements OnInit, AfterContentInit, OnChanges {
  @ViewChildren(SelectOptionComponent)
  public optionsComponents: QueryList<SelectOptionComponent>;

  @Input()
  @Optional()
  initialValue: any;

  @Input()
  options: SelectionOption[];

  @Output()
  selectValueChange = new EventEmitter<SelectionOption>();

  selectValue: any;

  isOpen = false;

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

  get selectedOption(): SelectionOption {
    if (this.selectValue) {
      const selectedValue = this.options.find((x) => x.value === this.selectValue);
      return selectedValue;
    }
  }

  get selectedOptionComponent(): SelectOptionComponent {
    if (this.selectValue) {
      const selectedValue = this.optionsComponents
        .toArray()
        .find((x) => x.value.value === this.selectValue);
      return selectedValue;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.initialValue?.previousValue &&
      changes.initialValue.currentValue !== changes.initialValue.previousValue
    ) {
      this.selectValue = this.initialValue;
    }
  }

  ngOnInit(): void {
    this.initInitialValue();
  }

  initInitialValue(): void {
    if (this.initialValue) {
      this.selectValue = this.initialValue;
    } else {
      this.selectValue = this.options[0].value;
    }
  }

  ngAfterContentInit(): void {}

  onSelect(option: SelectionOption): void {
    this.selectValue = option.value;
    this.selectValueChange.emit(this.selectedOption.value);
    this.closeDropdown();
  }

  public selectOption(optionComponent: SelectOptionComponent) {
    this.selectValue = optionComponent.value.value;
    this.selectValueChange.emit(this.selectedOption.value);
    this.closeDropdown();
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
