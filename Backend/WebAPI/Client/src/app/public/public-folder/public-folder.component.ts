import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { DeltaConverter } from 'src/app/editor/converter/delta-converter';

@Component({
  selector: 'app-public-folder',
  templateUrl: './public-folder.component.html',
  styleUrls: ['./public-folder.component.scss'],
})
export class PublicFolderComponent implements OnInit {
  @Select(FolderStore.isFullFolderEditor)
  isFullFolderEditor$?: Observable<boolean>;

  folderId: string;

  async ngOnInit(): Promise<void> {
    DeltaConverter.initQuill();
  }

  get navigateUrl(): string {
    return `folders/${this.folderId}`;
  }

  constructor(private readonly route: ActivatedRoute) {
    this.route.params.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.folderId = params.id;
    });
  }
}
