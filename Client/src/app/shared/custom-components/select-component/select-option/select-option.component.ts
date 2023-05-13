import { Highlightable } from '@angular/cdk/a11y';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { SelectionOption } from '../entities/select-option';

@Component({
  selector: 'app-select-option',
  templateUrl: './select-option.component.html',
  styleUrls: ['./select-option.component.scss'],
})
export class SelectOptionComponent implements Highlightable {
  @Input()
  public value: SelectionOption;

  @Input()
  public isSelected: boolean;

  @Output()
  public selectEvent = new EventEmitter<SelectionOption>();

  @HostBinding('class.active')
  public active = false;

  @HostBinding('class.selected')
  public get selected(): boolean {
    return this.isSelected;
  }

  @HostListener('click', ['$event'])
  public onClick(event: UIEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.selectEvent.emit(this.value);
  }

  public setActiveStyles(): void {
    this.active = true;
  }

  public setInactiveStyles(): void {
    this.active = false;
  }

  public getLabel(): string {
    // TODO TEST
    return this.value.value;
  }
}
