import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGenericSaveComponent } from './dialog-generic-save.component';

describe('DialogGenericSaveComponent', () => {
  let component: DialogGenericSaveComponent;
  let fixture: ComponentFixture<DialogGenericSaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogGenericSaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogGenericSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
