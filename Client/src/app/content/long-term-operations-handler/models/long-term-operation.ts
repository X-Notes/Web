import { HttpEventType } from '@angular/common/http';
import { Subject } from 'rxjs';

export interface LongTermOperation {
  title: string;
  titleShort: string;
  titleMedium: string;
  startAt: Date;
  isGeneralCancelButtonActive: boolean;
  isDetailViewActive: boolean;
  isDetailViewOpened: boolean;
  isHeaderSpinnerActive: boolean;
  details: OperationDetailMini[];
}

export interface OperationDetailMini {
  icon: string;
  name: string;
  isCancelable: boolean;
  isShowProcess: boolean;
  procent: number;
  obs: Subject<any>;
  status?: HttpEventType;
}
