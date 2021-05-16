import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractionInnerFolderComponent } from './interaction-inner-folder.component';

describe('InteractionInnerFolderComponent', () => {
  let component: InteractionInnerFolderComponent;
  let fixture: ComponentFixture<InteractionInnerFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InteractionInnerFolderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionInnerFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
