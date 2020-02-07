import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Label } from 'src/app/Models/Labels/Label';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.sass']
})
export class FullNoteComponent implements OnInit {

  private id: string;
  private subscription: Subscription;
  private youtube = false;
  private labels: Label[] = [
    { id: '24', name: 'work', color: '#FFCDCD'},
    { id: '24', name: 'instanse', color: '#FFCDCD'},
    { id: '24', name: 'homework', color: '#FFCDCD'},
    { id: '24', name: 'Database', color: '#FFCDCD'},
    { id: '24', name: 'LoremIpsums124124124', color: '#FFCDCD'},
    { id: '24', name: '23', color: '#FFCDCD'},
    { id: '24', name: '23', color: '#FFCDCD'},
    { id: '24', name: '23', color: '#FFCDCD'},
    { id: '24', name: '23', color: '#FFCDCD'},
    { id: '24', name: '23', color: '#FFCDCD'},
    { id: '24', name: '23', color: '#FFCDCD'},
    { id: '24', name: '23', color: '#FFCDCD'},
    { id: '24', name: '23', color: '#FFCDCD'},
    { id: '24', name: '23', color: '#FFCDCD'},
  ];
  constructor(private activateRoute: ActivatedRoute) {
    this.subscription = activateRoute.params.subscribe(params => this.id = params.id);
   }

  ngOnInit() {
  }

  youTubeMenu() {
    this.youtube = !this.youtube;
  }
}
