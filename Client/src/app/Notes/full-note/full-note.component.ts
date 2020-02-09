import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Label } from 'src/app/Models/Labels/Label';
import { NotesService } from 'src/app/Services/notes.service';
import { UpdateTitle } from 'src/app/Models/Notes/UpdateTitle';
import { FullNote } from 'src/app/Models/Notes/FullNote';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.sass']
})
export class FullNoteComponent implements OnInit {

  // Content
  private title: string;
  private titleTimer;
  //
  private id: string;
  public note: FullNote;
  private subscription: Subscription;
  public youtube = false;
  public labels: Label[] = [
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
  constructor(private activateRoute: ActivatedRoute, private noteService: NotesService ) {
    this.subscription = activateRoute.params.subscribe(params => this.id = params.id);
   }

  ngOnInit() {
    this.noteService.getById(this.id).subscribe(x => this.note = x , error => console.log(error));
  }

  youTubeMenu() {
    this.youtube = !this.youtube;
  }

  changeTitle(event) {
    this.title = event;
    const newTitle: UpdateTitle = {
      id: this.id,
      title: this.title
    };
    clearTimeout(this.titleTimer);
    this.titleTimer = setTimeout(() => this.noteService.updateTitle(newTitle).subscribe(x => x ), 300);
  }
}
