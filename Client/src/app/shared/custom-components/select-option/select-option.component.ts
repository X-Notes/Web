import { Component, ElementRef, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { SelectService } from '../../services/select.service';
import { SelectComponent } from '../select/select.component';

@Component({
  selector: 'app-select-option',
  templateUrl: './select-option.component.html',
  styleUrls: ['./select-option.component.scss']
})
export class SelectOptionComponent implements OnInit {

  @Input()
  public value: string;

  private select: SelectComponent;

  @HostBinding('class.active')
  public active = false;

  constructor(private selectnService: SelectService) {
    this.select = this.selectnService.getSelect();
  }

  ngOnInit(): void {
  }

  public setActiveStyles(): void {
    this.active = true;
  }

  public setInactiveStyles(): void {
    this.active = false;
  }

  @HostListener('click', ['$event'])
  public onClick(event: UIEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.select.selectOption(this);
  }

}
