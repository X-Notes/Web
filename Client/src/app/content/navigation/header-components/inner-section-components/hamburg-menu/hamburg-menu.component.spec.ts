import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HamburgMenuComponent } from './hamburg-menu.component';

describe('HamburgMenuComponent', () => {
  let component: HamburgMenuComponent;
  let fixture: ComponentFixture<HamburgMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HamburgMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HamburgMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
