import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  @Output() changeOutput = new EventEmitter<string>();

  searchStr: string;

  changed(value: any) {
    this.changeOutput.emit(value);
  }
}
