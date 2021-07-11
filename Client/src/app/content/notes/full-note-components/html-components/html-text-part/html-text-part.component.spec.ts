import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlTextPartComponent } from './html-text-part.component';

describe('HtmlTextPartComponent', () => {
  let component: HtmlTextPartComponent;
  let fixture: ComponentFixture<HtmlTextPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HtmlTextPartComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlTextPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
