import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform : 'translateY(-70%)', opacity: '*'}),
        animate('300ms ease-out', style({transform: 'translateY(0%)', height: '*'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(-30%)', opacity: '0.5', height: '0px', overflow: 'hidden'}))
      ]),
    ])
  ]
})
export class UserComponent implements OnInit {

  constructor() { }
  update = false;
  color = '#DDFFCD';
  hideElement() {
    this.update = !this.update;
  }
  changeColor(id) {
    if ('firstLi' === id) {
      this.color = '#FFCDCD';
    } else if ('secondLi' === id) {
      this.color = '#FFEBCD';
    } else if ('thirdLi' === id) {
      this.color = '#FFFDCD';
    } else if ('fourthLi' === id) {
      this.color = '#DDFFCD';
    } else if ('fifthLi' === id) {
      this.color = '#CDFFD8';
    } else if ('sixLi' === id) {
      this.color = '#CDFFFC';
    } else if ('sevenLi' === id) {
      this.color = '#CDEEFF';
    } else if ('eightLi' === id) {
      this.color = '#CDD5FF';
    } else if ('nineLi' === id) {
      this.color = '#EFCDFF';
    } else if ('tenLi' === id) {
      this.color = '#FFCDF4';
    }
 }
  ngOnInit() {

  }

}
