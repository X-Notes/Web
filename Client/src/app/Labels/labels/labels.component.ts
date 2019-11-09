import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.sass']
})
export class LabelsComponent implements OnInit {

  constructor() { }
  // currentState = 'initial';
  update = false;
  h1color = '#DDFFCD';
  changeColor(id) {
    if ('firstLi' === id) {
      this.h1color = '#FFCDCD';
    } else if ('secondLi' === id) {
      this.h1color = '#FFEBCD';
    } else if ('thirdLi' === id) {
      this.h1color = '#FFFDCD';
    } else if ('fourthLi' === id) {
      this.h1color = '#DDFFCD';
    } else if ('fifthLi' === id) {
      this.h1color = '#CDFFD8';
    } else if ('sixLi' === id) {
      this.h1color = '#CDFFFC';
    } else if ('sevenLi' === id) {
      this.h1color = '#CDEEFF';
    } else if ('eithLi' === id) {
      this.h1color = '#CDD5FF';
    } else if ('nineLi' === id) {
      this.h1color = '#EFCDFF';
    } else if ('tenLi' === id) {
      this.h1color = '#FFCDF4';
    }
 }
  update22() {
    // this.currentState = this.currentState === 'initial' ? 'final' : 'initial';
  }
  ngOnInit() {
  }

}
