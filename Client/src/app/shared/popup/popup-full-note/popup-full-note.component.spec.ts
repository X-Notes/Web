import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupFullNoteComponent } from './popup-full-note.component';

describe('PopupFullNoteComponent', () => {
  let component: PopupFullNoteComponent;
  let fixture: ComponentFixture<PopupFullNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupFullNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupFullNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
