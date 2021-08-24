import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OperationDetailMini } from 'src/app/content/long-term-operations-handler/models/long-term-operation';

export class FileProcessTracker<T>{
  isUploaded: boolean;
  eventBody: T;
   
  constructor(isUploaded: boolean = false, eventBody?: T){
    this.isUploaded = isUploaded;
    this.eventBody = eventBody;
  }

};

export interface FileUploadProcessInfo{
  status: string;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class SnackBarFileProcessHandlerService {

  constructor() {}

  trackFileUploadProcess<T>(obs: Observable<HttpEvent<T>>, operation: OperationDetailMini): Observable<FileProcessTracker<T>>{
    return obs.pipe(map((event):FileProcessTracker<T> => {
      switch (event.type) {
        case HttpEventType.Sent: {
          operation.status = event.type;
          return new FileProcessTracker<T>();
        }
        case HttpEventType.UploadProgress: {
          operation.status = event.type;
          operation.procent = Math.round(90 * event.loaded / (event.total)) ?? 0;
          return new FileProcessTracker<T>();
        }
        case HttpEventType.Response:{
          operation.status = event.type;
          operation.procent = 100;
          return new FileProcessTracker<T>(true, event.body);
        }
        default: {
          return new FileProcessTracker<T>();
        }
      }
    }));
  }

}
