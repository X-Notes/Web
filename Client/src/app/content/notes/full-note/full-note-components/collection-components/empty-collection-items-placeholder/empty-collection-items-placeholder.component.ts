import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-empty-collection-items-placeholder',
  templateUrl: './empty-collection-items-placeholder.component.html',
  styleUrls: ['./empty-collection-items-placeholder.component.scss'],
})
export class EmptyCollectionItemsPlaceholderComponent implements OnInit {
  @Input() title: string;

  ngOnInit(): void {}
}
