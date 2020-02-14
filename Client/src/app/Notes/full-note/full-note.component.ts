import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit
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
    window.addEventListener(
      'keydown',
      e => {
        if ([38, 40, 13].indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
      },
      false
    );
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

  updateText(str: string, id: string, index: number) {
    const obj: UpdateText = {
      noteId: this.note.Id,
      partId: id,
      description: str
    };
    const text = this.note.Parts[index] as Text;
    if (text.Description !== str) {
    this.partsService
      .updateText(obj)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        x => x,
        error => console.log(error)
      );
      }
  }
  backSpace(str: string, id: string, index: number, event) {
    if (str === '') {
      if (index > 0) {
        event.preventDefault();
        this.note.Parts = this.note.Parts.filter(x => x.Id !== id);
        const element = document.getElementById(`${--index}`);
        this.MovingCursorToEnd(element);
        const line: DeleteLine = {
          noteId: this.note.Id,
          partId: id
        };
        this.partsService
          .deleteLine(line)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(
            x => x,
            error => console.log(error)
          );
      }
    }
  }

  downToContent() {
    const el = document.getElementById('0');
    this.MovingCursorToEnd(el);
  }
  enter(index: number) {
    const text: Text = {
      Id: null,
      Description: null,
      Type: 'text'
    };
    this.note.Parts.splice(++index, 0, text);
    setTimeout(() => document.getElementById(`${index}`).focus(), 50);
    const newLine: NewLine = {
      noteId: this.note.Id,
      order: index
    };
    this.partsService
      .newLine(newLine)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        x => (text.Id = x),
        error => console.log(error)
      );
  }
  up(index: number) {
    let element = document.getElementById(`${index - 1}`);
    if (element !== null) {
      this.movingCursor(element);
    } else {
      element = document.getElementById('title');
      this.MovingCursorToEnd(element);
    }
  }
  down(index: number) {
    const el = document.getElementById(`${index + 1}`);
    if (el !== null) {
      this.movingCursor(el);
    }
  }
  movingCursor(el: any) {
    const range = document.createRange();
    const sel = window.getSelection();
    const child = el.childNodes[0];
    if (child !== undefined) {
      if (child.textContent.length < sel.anchorOffset) {
        range.setStart(el.childNodes[0], child.textContent.length);
      } else {
        range.setStart(el.childNodes[0], sel.anchorOffset);
      }
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      el.focus();
    }
  }
  MovingCursorToEnd(el: any) {
    const range = document.createRange();
    const sel = window.getSelection();
    const child = el.childNodes[0];
    if (child !== undefined) {
      range.setStart(el.childNodes[0], child.textContent.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      el.focus();
    }
  }
}
