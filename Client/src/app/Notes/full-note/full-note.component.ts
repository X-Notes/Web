import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Label } from 'src/app/Models/Labels/Label';
import { NotesService } from 'src/app/Services/notes.service';
import { UpdateTitle } from 'src/app/Models/Notes/UpdateTitle';
import { FullNote } from 'src/app/Models/Notes/FullNote';
import { PartsService } from 'src/app/Services/parts.service';
import { takeUntil, timeout } from 'rxjs/operators';
import { Text } from 'src/app/Models/Parts/Text';
import { NewLine } from 'src/app/Models/PartText/NewLine';
import { UpdateText } from 'src/app/Models/PartText/UpdateText';
import { DeleteLine } from 'src/app/Models/PartText/DeleteLine';
import { CommonList } from 'src/app/Models/Parts/CommonList';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.sass']
})
export class FullNoteComponent implements OnInit {
  // Content

  @ViewChild('editor', {static: false}) editor: ElementRef;
  cursorPosition = 0;

  private title: string;
  private titleTimer;
  unsubscribe = new Subject();
  private id: string;
  public note: FullNote;
  private subscription: Subscription;
  public youtube = false;
  public labels: Label[] = [
    { id: '24', name: 'work', color: '#FFCDCD' },
    { id: '24', name: 'instanse', color: '#FFCDCD' },
    { id: '24', name: 'homework', color: '#FFCDCD' },
    { id: '24', name: 'Database', color: '#FFCDCD' },
    { id: '24', name: 'LoremIpsums124124124', color: '#FFCDCD' },
    { id: '24', name: '23', color: '#FFCDCD' },
    { id: '24', name: '23', color: '#FFCDCD' },
    { id: '24', name: '23', color: '#FFCDCD' },
    { id: '24', name: '23', color: '#FFCDCD' },
    { id: '24', name: '23', color: '#FFCDCD' },
    { id: '24', name: '23', color: '#FFCDCD' },
    { id: '24', name: '23', color: '#FFCDCD' },
    { id: '24', name: '23', color: '#FFCDCD' },
    { id: '24', name: '23', color: '#FFCDCD' }
  ];
  constructor(
    private activateRoute: ActivatedRoute,
    private noteService: NotesService,
    private partsService: PartsService
  ) {
    this.subscription = activateRoute.params.subscribe(
      params => (this.id = params.id)
    );
  }
  ngOnInit() {
    const commonList: CommonList[] = [
      {Description: 'Fartu Masti1', Id: 'sss', Type: 'common'},
      {Description: 'Fartu Masti2', Id: 'sss', Type: 'common'},
      {Description: 'Fartu Masti3', Id: 'sss', Type: 'common'},
      {Description: 'Fartu Masti4', Id: 'sss', Type: 'common'},
      {Description: 'Fartu Masti5', Id: 'sss', Type: 'common'},
      {Description: 'Fartu Masti6', Id: 'sss', Type: 'common'},
    ];
    this.noteService
      .getById(this.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        x => {
          this.note = x;
          this.note.Parts.push(...commonList);
        },
        error => console.log(error)
      );
    document.execCommand('styleWithCSS', true, null);
    document.execCommand('defaultParagraphSeparator', false, 'div');
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
    this.titleTimer = setTimeout(
      () =>
        this.noteService
          .updateTitle(newTitle)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(x => x),
      300
    );
  }


  space($event: KeyboardEvent) {
    if ($event.keyCode === 8) {
      if (this.editor.nativeElement.textContent.length === 0 && this.editor.nativeElement.childNodes.length === 1) {
        $event.preventDefault();
        return;
      }
    }
    this.cursorPosition  = window.getSelection().getRangeAt(0).getBoundingClientRect().y;
  }
  show(event) {
    this.cursorPosition  = window.getSelection().getRangeAt(0).getBoundingClientRect().y;
  }


  onInput(event) {

  }

  checkList() {
    console.log('check');
  }
  dotList() {
    document.execCommand('insertUnorderedList');
  }
  numberList() {
    document.execCommand('insertOrderedList');
  }
}
