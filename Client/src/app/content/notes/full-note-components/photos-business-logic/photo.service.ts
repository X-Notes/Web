import { Injectable } from '@angular/core';

@Injectable()
export class PhotoService {
  top: number;

  left: number;

  constructor() {}

  setPosition(top: number, left: number) {
    this.top = top;
    this.left = left;
  }
}
