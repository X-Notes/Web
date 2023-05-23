import { Component, Input } from '@angular/core';
import { collapse } from '../../../shared/services/personalization.service';

@Component({
  selector: 'app-faq-list-item',
  templateUrl: './faq-list-item.component.html',
  styleUrls: ['./faq-list-item.component.scss'],
  animations: [collapse],
})
export class FaqListItemComponent {
  @Input()
  isMatched?: boolean;

  expand = false;
}
