import { OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Component, OnInit, NgModule } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotesService } from 'src/app/Services/notes.service';
import { SmallNote } from 'src/app/Models/Notes/SmallNote';

@NgModule({
  imports: [BrowserAnimationsModule, BrowserModule]
})

@Component({
  selector: 'app-all-notes',
  templateUrl: './all-notes.component.html',
  styleUrls: ['./all-notes.component.sass'],
  animations: []
})
export class AllNotesComponent implements OnInit, OnDestroy {

  unsubscribe = new Subject();
  constructor(private router: Router, private notesService: NotesService) { }

  update = false;
  updateMenu: string[] = [];
  notes: SmallNote[];

  RemoveChanged(id: string) {
    this.updateMenu = this.updateMenu.filter(x => x !== id);
    if (this.updateMenu.length > 0) {
      this.update = true;
    } else {
      this.update = false;
    }
  }
  AddChanged(id: string) {
    this.updateMenu.push(id);
    this.update = true;
  }

  ngOnInit() {
    this.notesService.getAll()
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(x => { this.notes = x; }, error => console.log(error));
  }

  OpenNoot(id: string) {
    this.router.navigate(['/notes', id]);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.unsubscribe();
  }
}

