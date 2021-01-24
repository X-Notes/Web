import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @Output() changeOutput = new EventEmitter<string>();
  searchStr: string;

  constructor() { }

  ngOnInit(): void {
  }

  changed(value: any) {
    this.changeOutput.emit(value);
}

}
