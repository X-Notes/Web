import { Injectable } from '@angular/core';
import { SelectComponent } from '../select/select.component';

@Injectable({
  providedIn: 'root',
})
export class SelectService {
  private select: SelectComponent;

  public register(select: SelectComponent) {
    this.select = select;
  }

  public getSelect(): SelectComponent {
    return this.select;
  }
}
