import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlNumberListComponent } from './html-number-list.component';

describe('HtmlNumberListComponent', () => {
  let component: HtmlNumberListComponent;
  let fixture: ComponentFixture<HtmlNumberListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HtmlNumberListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlNumberListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
