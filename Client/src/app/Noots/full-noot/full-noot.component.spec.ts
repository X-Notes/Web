import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullNootComponent } from './full-noot.component';

describe('FullNootComponent', () => {
  let component: FullNootComponent;
  let fixture: ComponentFixture<FullNootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullNootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullNootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
