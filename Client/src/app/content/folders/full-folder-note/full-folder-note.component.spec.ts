import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullFolderNoteComponent } from './full-folder-note.component';

describe('FullFolderNoteComponent', () => {
  let component: FullFolderNoteComponent;
  let fixture: ComponentFixture<FullFolderNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullFolderNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullFolderNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
