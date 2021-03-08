import { Highlightable } from '@angular/cdk/a11y';
import { Component, ElementRef, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { SelectService } from '../../services/select.service';
import { SelectComponent } from '../select/select.component';

@Component({
  selector: 'app-select-option',
  templateUrl: './select-option.component.html',
  styleUrls: ['./select-option.component.scss']
})
export class SelectOptionComponent implements OnInit, Highlightable {

  @Input()
  public value: string;

  private select: SelectComponent;

  @HostBinding('class.selected')
  public get selected(): boolean {
    return this.select.selectedOption === this;
  }

  @HostBinding('class.active')
  public active = false;

  constructor(private selectService: SelectService) {
    this.select = this.selectService.getSelect();
  }

  public setActiveStyles(): void {
    this.active = true;
  }

  public setInactiveStyles(): void {
    this.active = false;
  }

  public getLabel(): string {
    return this.value;
  }

  ngOnInit(): void {
    this.value.toLowerCase();
  }

  @HostListener('click', ['$event'])
  public onClick(event: UIEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.select.selectOption(this);
  }

}
