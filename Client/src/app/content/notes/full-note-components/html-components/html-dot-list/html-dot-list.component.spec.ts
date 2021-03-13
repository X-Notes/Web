import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlDotListComponent } from './html-dot-list.component';

describe('HtmlDotListComponent', () => {
  let component: HtmlDotListComponent;
  let fixture: ComponentFixture<HtmlDotListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HtmlDotListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlDotListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
