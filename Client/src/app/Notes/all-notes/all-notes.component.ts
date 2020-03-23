import { OnDestroy, DoCheck } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Component, OnInit} from '@angular/core';
import { NotesService } from 'src/app/Services/notes.service';
import { SmallNote } from 'src/app/Models/Notes/SmallNote';
import { trigger, state, style, transition, animate, group } from '@angular/animations';

@Component({
  selector: 'app-all-notes',
  templateUrl: './all-notes.component.html',
  styleUrls: ['./all-notes.component.sass'],
  animations: [
    trigger('flyInOut', [
      state('in', style({
        opacity: 1,
        transform: 'translateY(-100%)'
      })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(-100%)'}),
          animate('.2s ease-out', style({
            opacity: 1,
            transform: 'translateY(0%)'
          })),
      ]),
      transition('* => void', [
        style({ opacity: 1, transform: 'translateY(0%)' }),
          animate('.2s ease-in', style({
            opacity: 0,
            transform: 'translateY(-100%)'
          })),
      ])
    ])
  ]
})
export class AllNotesComponent implements OnInit, OnDestroy {

  unsubscribe = new Subject();
  constructor(private router: Router, private notesService: NotesService) { }

  width: any;
  update = false;
  updateMenu: string[] = [];
  notes: SmallNote[];

  RemoveChanged(id: string) {
    this.updateMenu = this.updateMenu.filter(x => x !== id);
    if (this.updateMenu.length > 0) {
      this.update = true;
    } else {
      this.update = false;
      this.AddMarginItems();
    }
  }
  AddChanged(id: string) {
    this.updateMenu.push(id);
    this.update = true;
    this.AddMarginItems();
  }

  AddMarginItems() {
    const body = document.getElementsByTagName('body')[0].clientWidth;
    const margin = document.getElementsByClassName('wrapper-items')[0];
    if ( body < 1199) {
      if ( this.update === true) {
        margin.classList.add('margin-add');
      } else {
        margin.classList.remove('margin-add');
      }
    }
  }

  ngOnInit() {
    this.notesService.getAll()
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(x => { this.notes = x; }, error => console.log(error));
  }

  OpenNoot(id: string) {
    this.router.navigate(['/notes/note', id]);
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.unsubscribe();
  }
}

