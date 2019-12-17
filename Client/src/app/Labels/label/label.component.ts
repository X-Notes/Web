import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { Label } from 'src/app/Models/Labels/Label';


@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.sass'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform : 'translateY(-70%)', opacity: '*'}),
        animate('300ms ease-out', style({transform: 'translateY(0%)', height: '*', 'z-index': '-1'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(-50%)', opacity: '0.5', height: '0px'}))
      ]),
    ])
  ]
})
export class LabelComponent implements OnInit {

  constructor() { }

  @Output() updateLabel = new EventEmitter<Label>();
  @Output() deleteLabel = new EventEmitter<string>();
  @Input() label: Label;

  update = false;

  ChangeIcon() {
    this.update = !this.update;
  }
  Delete() {
    this.deleteLabel.emit(this.label.id);
  }
  ChangeName() {
    this.updateLabel.emit(this.label);
  }
  ChangeColor(color) {
    this.label.color = color;
    this.updateLabel.emit(this.label);
    this.update = false;
 }
  ngOnInit() {
  }

}
