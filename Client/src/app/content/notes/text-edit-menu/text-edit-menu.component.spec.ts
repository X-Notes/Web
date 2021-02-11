import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditMenuComponent } from './text-edit-menu.component';

describe('TextEditMenuComponent', () => {
  let component: TextEditMenuComponent;
  let fixture: ComponentFixture<TextEditMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextEditMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextEditMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
