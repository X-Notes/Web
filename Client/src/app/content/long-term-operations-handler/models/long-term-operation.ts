import { HttpEventType } from "@angular/common/http";

export interface LongTermOperation{
    title: string;
    isDetailViewActive: boolean;
    isDetailViewOpened: boolean;
    details: OperationDetailMini[];
}

export interface OperationDetailMini {
    icon: string;
    name: string;
    isCancelable: boolean;
    isShowProcess: boolean;
    procent: number;
    status?: HttpEventType;
}