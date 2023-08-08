import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { searchNotesFoldersDelay } from 'src/app/core/defaults/bounceDelay';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { SearchNotesFolders } from 'src/app/core/models/search/search-notes-folders';
import { SearchNotes } from 'src/app/core/models/search/search-notes';
import { SearchFolders } from 'src/app/core/models/search/search-folders';

@Component({
  selector: 'app-search-dialog',
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss']
})
export class SearchDialogComponent implements OnInit {

  searchChanged$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  searchResult: SearchNotesFolders = null;

  searchSymbols = 2;

  isSearching = false;

  constructor(
    public dialogRef: MatDialogRef<SearchDialogComponent>,
    private readonly searchService: SearchService,
    private readonly router: Router) {
    this.searchChanged$
      .pipe(debounceTime(searchNotesFoldersDelay), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(async (searchStr) => {
        if (searchStr?.length > this.searchSymbols) {
          this.isSearching = true;
          this.searchResult = await this.searchService.searchNotesAndFolder(searchStr).toPromise();
        } else {
          this.searchResult = null;
        }
        this.isSearching = false;
      });
  }

  get isSearchActive(): boolean {
    return !this.isSearching && this.searchChanged$?.getValue()?.length > this.searchSymbols;
  }

  get isSearchDisabled(): boolean {
    return !this.isSearching && (this.searchChanged$?.getValue()?.length ?? 0) <= this.searchSymbols;
  }

  get isEmpty(): boolean {
    return this.notesView.length === 0 && this.foldersView.length === 0;
  }

  get notesView(): SearchNotes[] {
    return this.searchResult?.notesResult ?? [];
  }

  get foldersView(): SearchFolders[] {
    return this.searchResult?.foldersResult ?? [];
  }

  ngOnInit(): void { }

  onSearch(value: string): void {
    this.searchResult = null;
    this.searchChanged$.next(value);
  }

  goToNote(id: string): void {
    this.router.navigateByUrl(`notes/${id}`);
    this.dialogRef.close();
  }

  goToFolder(id: string): void {
    this.router.navigateByUrl(`folders/${id}`);
    this.dialogRef.close();
  }
}
