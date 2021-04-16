import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNotesInFolderComponent } from './manage-notes-in-folder.component';

describe('ManageNotesInFolderComponent', () => {
  let component: ManageNotesInFolderComponent;
  let fixture: ComponentFixture<ManageNotesInFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageNotesInFolderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageNotesInFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
