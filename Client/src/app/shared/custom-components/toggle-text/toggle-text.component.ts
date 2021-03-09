import { Component, Input, OnInit, Optional } from '@angular/core';

@Component({
  selector: 'app-toggle-text',
  templateUrl: './toggle-text.component.html',
  styleUrls: ['./toggle-text.component.scss']
})
export class ToggleTextComponent implements OnInit {

  @Input()
  @Optional()
  color: string;

  constructor() { }

  ngOnInit(): void {
  }

}
