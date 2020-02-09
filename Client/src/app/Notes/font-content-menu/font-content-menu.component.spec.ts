import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FontContentMenuComponent } from './font-content-menu.component';

describe('FontContentMenuComponent', () => {
  let component: FontContentMenuComponent;
  let fixture: ComponentFixture<FontContentMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FontContentMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FontContentMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
