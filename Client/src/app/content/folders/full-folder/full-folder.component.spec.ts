import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullFolderComponent } from './full-folder.component';

describe('FullFolderComponent', () => {
  let component: FullFolderComponent;
  let fixture: ComponentFixture<FullFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
