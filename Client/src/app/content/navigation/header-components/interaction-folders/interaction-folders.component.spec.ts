import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractionFoldersComponent } from './interaction-folders.component';

describe('InteractionFoldersComponent', () => {
  let component: InteractionFoldersComponent;
  let fixture: ComponentFixture<InteractionFoldersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractionFoldersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionFoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
