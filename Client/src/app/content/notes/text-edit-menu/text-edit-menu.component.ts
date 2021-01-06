import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-text-edit-menu',
  templateUrl: './text-edit-menu.component.html',
  styleUrls: ['./text-edit-menu.component.scss']
})
export class TextEditMenuComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  preventUnSelection(e)
  {
    e.stopPropagation();
    return false;
  }
}
