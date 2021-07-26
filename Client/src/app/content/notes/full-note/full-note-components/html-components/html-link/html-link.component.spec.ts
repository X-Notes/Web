import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlLinkComponent } from './html-link.component';

describe('HtmlLinkComponent', () => {
  let component: HtmlLinkComponent;
  let fixture: ComponentFixture<HtmlLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HtmlLinkComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
