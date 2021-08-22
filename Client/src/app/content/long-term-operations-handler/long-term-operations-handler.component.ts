import { Component, OnInit } from '@angular/core';
import { LongTermOperationsHandlerService } from './services/long-term-operations-handler.service';

@Component({
  selector: 'app-long-term-operations-handler',
  templateUrl: './long-term-operations-handler.component.html',
  styleUrls: ['./long-term-operations-handler.component.scss']
})
export class LongTermOperationsHandlerComponent implements OnInit {

  constructor(public longTermOperations: LongTermOperationsHandlerService) { }

  ngOnInit(): void {
  }
}
