import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-results-illustration',
  templateUrl: './no-results-illustration.component.html',
  styleUrls: ['./no-results-illustration.component.scss'],
})
export class NoResultsIllustrationComponent {
  @Input() message: string;

  @Input() illustration: string;

  @Input() typeClass: string;
}
