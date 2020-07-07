import { Component, OnInit, Input } from '@angular/core';
import { changeColorLabel } from 'src/app/shared/services/personalization.service';
import { Label } from '../models/label';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  animations: [ changeColorLabel ]
})
export class LabelComponent implements OnInit {

  @Input() label: Label;

  isUpdate = false;

  constructor() { }

  ngOnInit(): void {
  }

  openColors() {
    this.isUpdate = !this.isUpdate;
  }

  changeColor(value: string) {
    this.label.color = value;
    this.isUpdate = false;
  }

}
