import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGenericHeaderComponent } from './dialog-generic-header.component';

describe('DialogGenericHeaderComponent', () => {
  let component: DialogGenericHeaderComponent;
  let fixture: ComponentFixture<DialogGenericHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogGenericHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogGenericHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
