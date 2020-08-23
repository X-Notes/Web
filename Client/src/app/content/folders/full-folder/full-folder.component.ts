import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateFolderType } from 'src/app/core/stateApp/app-action';
import { FolderType } from 'src/app/shared/enums/FolderTypes';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss']
})
export class FullFolderComponent implements OnInit {

  constructor(private store: Store) { }

  ngOnInit(): void {

    this.store.dispatch(new UpdateFolderType(FolderType.Inner));

  }

}
