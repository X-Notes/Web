import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallNoteComponent } from './small-note.component';

describe('SmallNoteComponent', () => {
  let component: SmallNoteComponent;
  let fixture: ComponentFixture<SmallNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmallNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
