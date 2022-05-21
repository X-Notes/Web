import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { searchDelay } from 'src/app/core/defaults/bounceDelay';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SearchService } from 'src/app/shared/services/search.service';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
})
export class SearchInputComponent implements OnInit {
  @ViewChild('searchInput') searchInput: ElementRef;

  isInputFocus = false;

  searchStrChanged: Subject<string> = new Subject<string>();

  searchStr: string;

  searchResult = [];

  constructor(
    public readonly pService: PersonalizationService,
    private readonly searchService: SearchService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.searchStrChanged
      .pipe(debounceTime(searchDelay), distinctUntilChanged())
      .subscribe(async (searchStr) => {
        if (searchStr?.length > 1) {
          const items = await this.searchService.searchNotesAndFolder(searchStr).toPromise();
          const notes = items.noteSearchs.map((x) => ({ ...x, type: 'notes' }));
          const folders = items.folderSearchs.map((x) => ({ ...x, type: 'folders' }));
          this.searchResult = [...notes, ...folders];
        } else {
          this.searchResult = [];
        }
      });
  }

  unFocusSearch() {
    setTimeout(() => {
      this.isInputFocus = false;
    }, 100);
  }

  searchData() {
    if (!this.pService.isWidth600()) {
      this.isInputFocus = !this.isInputFocus;
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      });
    }
  }

  goTo(id: string, type: string) {
    if (type === 'notes') {
      this.router.navigateByUrl(`notes/${id}`);
      return;
    }
    this.router.navigateByUrl(`folders/${id}`);
  }
}
