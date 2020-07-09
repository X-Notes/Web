import { Component, OnInit, Input } from '@angular/core';
import { changeColorLabel } from 'src/app/shared/services/personalization.service';
import { Person } from '../models/person';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss'],
  animations: [ changeColorLabel ]
})
export class PersonComponent implements OnInit {

  @Input() person: Person;

  isUpdate = false;

  constructor() { }

  ngOnInit(): void {
  }

  openColors() {
    this.isUpdate = !this.isUpdate;
  }

  changeColor(value: string) {
    this.person.color = value;
    this.isUpdate = false;
  }

}
