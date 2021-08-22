import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LongTermOperation, OperationDetailMini } from '../models/long-term-operation';

@Component({
  selector: 'app-long-term-operation',
  templateUrl: './long-term-operation.component.html',
  styleUrls: ['./long-term-operation.component.scss']
})
export class LongTermOperationComponent implements OnInit {

  @Input()
  operation: LongTermOperation;

  constructor() { }

  ngOnInit(): void {
  }


  toogleIsDetailViewActive(){
    this.operation.isDetailViewOpened = !this.operation.isDetailViewOpened;
  }

  get firstItem(): OperationDetailMini{
    return this.operation.details[0];
  }

}
