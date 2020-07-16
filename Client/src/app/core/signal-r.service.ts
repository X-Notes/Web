import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { AuthService } from './auth.service';
import { Store } from '@ngxs/store';
import { UserStore } from './stateUser/user-state';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  constructor(private store: Store) {
    console.log('Create instance signalR');
    this.startConnection();
  }

  public hubConnection: signalR.HubConnection;

  private startConnection = () => {
    const token =  this.store.selectSnapshot(UserStore.getToken);
    this.hubConnection = new signalR.HubConnectionBuilder()
                            // .configureLogging(signalR.LogLevel.None)
                            .withUrl('http://localhost:5000/hub', { accessTokenFactory: () => token })
                            .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

}
