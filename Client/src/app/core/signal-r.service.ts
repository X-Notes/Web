import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  constructor(public auth: AuthService) {
    console.log('Create instance signalR');
    this.startConnection();
  }

  private hubConnection: signalR.HubConnection;

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
                            .withUrl('http://localhost:5000/hub', { accessTokenFactory: () => this.auth.getToken() })
                            .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public addTransferChartDataListener = () => {
    this.hubConnection.on('transferchartdata', (data) => {
      console.log(data);
    });
  }

}
