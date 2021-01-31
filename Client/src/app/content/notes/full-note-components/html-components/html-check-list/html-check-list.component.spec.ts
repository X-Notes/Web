import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlCheckListComponent } from './html-check-list.component';

describe('HtmlCheckListComponent', () => {
  let component: HtmlCheckListComponent;
  let fixture: ComponentFixture<HtmlCheckListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HtmlCheckListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlCheckListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
