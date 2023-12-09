import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IndexDbService {

  constructor() { }

  openNotes(): void {
    /*
    let openRequest = indexedDB.open("notes", 1);
    openRequest.onupgradeneeded = function() {
    };
    
    openRequest.onerror = function() {
      console.error("Error", openRequest.error);
    };
    
    openRequest.onsuccess = function() {
      let db = openRequest.result;
      console.log('db: ', db);
    };
    */
  }
}
