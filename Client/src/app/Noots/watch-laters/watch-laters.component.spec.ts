import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchLatersComponent } from './watch-laters.component';

describe('WatchLatersComponent', () => {
  let component: WatchLatersComponent;
  let fixture: ComponentFixture<WatchLatersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WatchLatersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchLatersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
