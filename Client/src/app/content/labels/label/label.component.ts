import { Component, OnInit } from '@angular/core';
import { changeColorLabel } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  animations: [ changeColorLabel ]
})
export class LabelComponent implements OnInit {

  isUpdate = false;
  color: string;

  constructor() { }

  ngOnInit(): void {
  }

  openColors() {
    this.isUpdate = !this.isUpdate;
  }

  changeColor(value: string) {
    this.color = value;
    this.isUpdate = false;
  }

}
