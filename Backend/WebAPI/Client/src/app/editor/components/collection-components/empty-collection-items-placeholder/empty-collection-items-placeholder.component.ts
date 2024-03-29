import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-collection-items-placeholder',
  templateUrl: './empty-collection-items-placeholder.component.html',
  styleUrls: ['./empty-collection-items-placeholder.component.scss'],
})
export class EmptyCollectionItemsPlaceholderComponent {
  @Input() title: string;

  @Input() isSpinnerActive: boolean;
}
