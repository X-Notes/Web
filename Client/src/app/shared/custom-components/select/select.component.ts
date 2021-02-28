import { ActiveDescendantKeyManager, FocusKeyManager } from '@angular/cdk/a11y';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { AfterViewInit, Component, ContentChildren, forwardRef, Input, OnInit, Optional, QueryList } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { showDropdown } from '../../services/personalization.service';
import { SelectService } from '../../services/select.service';
import { SelectOptionComponent } from '../select-option/select-option.component';
import { ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  animations: [ showDropdown ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    },
    SelectService
  ]
})
export class SelectComponent implements OnInit, AfterViewInit {

  isOpen = false;
  selected: string;
  public selectedOption: SelectOptionComponent;

  @ContentChildren(SelectOptionComponent)
  public options: QueryList<SelectOptionComponent>;

  @Input()
  @Optional()
  translate: string;

  @Input()
  @Optional()
  selectValue: string;

  public positions = [
    new ConnectionPositionPair({
      originX: 'end',
      originY: 'bottom'},
      {overlayX: 'end',
      overlayY: 'top'},
      0, 1)
  ];

  private keyManager: ActiveDescendantKeyManager<SelectOptionComponent>;

  constructor(private selectService: SelectService) {
    this.selectService.register(this);
  }
  ngAfterViewInit(): void {
    this.keyManager = new ActiveDescendantKeyManager(this.options).withWrap();
    setTimeout(() => {
      this.selectedOption = this.options.toArray().find(option => option.value === this.selectValue);
      this.selected = this.selectedOption ? this.selectedOption.value : '';
      this.keyManager.setActiveItem(this.options.toArray().indexOf(this.selectedOption));
    });
  }

  ngOnInit(): void {
  }

  onKeydown(event) {
    if (event.keyCode === ENTER && this.keyManager.activeItem?.value !== this.selected) {
      this.selected = this.keyManager.activeItem?.value;
      this.closeDropdown();
    }
    else {
      this.keyManager.onKeydown(event);
    }
  }

  public selectOption(option: SelectOptionComponent) {
    this.selectedOption = option;
    this.selected = this.selectedOption ? this.selectedOption.value : '';
    this.closeDropdown();
  }

  closeDropdown() {
    this.isOpen = false;
  }

}
